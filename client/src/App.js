import React from "react"
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import {Switch, Route, Redirect, Link} from "react-router-dom";

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            repos: [],
            error: null
        }
        this.HOST = window.location.origin;
        this.WSHOST = this.HOST.replace(/^http/, "ws");
        this.ws = new WebSocket(this.WSHOST);
        this.ws.onmessage = this._onMessage;

        this.ws.onopen = () => {
            const token = this.getToken();
            if (token) {
                const msg = { event: {type: "FETCH_REPOS", payload: {}}, token};
                console.log("sending saved token", msg);
                this.ws.send(JSON.stringify(msg));
            }
        }
    }

    async componentDidMount() {
        const token = this.getToken();
        if (token) {
            try {
                const result = await fetch(this.HOST + "/refresh", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                });
                const json = await result.json();
                console.log("check the token: ", json);

                if (!json.error) {
                    localStorage.setItem("token", json.token);
                } else {
                    this.logout();
                }
            } catch(e) {
                console.error(e);
            }
        }
    }

    _onMessage = (msg) => {
        const json = JSON.parse(msg.data);
        if (!json.error) {
            console.log("got message: ", json.event);
            switch(json.event.type ) {
                case "FETCH_REPOS":
                    this.setState({repos: json.event.payload});
                    break
                case "GREP_SEARCH":
                    console.log("this got called");
                    this.setState({data: json.event.payload});
                    break
                case "CLONE_REPO":
                    console.log("CLONE_REPO: ", json)
                    break
                default:
                    console.log("unkown event");
            }
        }
        else {
            alert(json.error);
        }
    }

    logout = () => localStorage.removeItem("token");
    getToken = () => localStorage.getItem("token");

    // TODO: Still need to handle when a token expires, how to figure that out?
    // I think when a token is expired we should return a special json to delete
    // current token from localstorage and redirect to login.
    render() {
        return (
            <>
                <nav className="nav nav-masthead justify-content-center">
                    <Link to="/" className="nav-link active">Home</Link>
                    <Link to="/login" className="nav-link">login</Link>
                    {
                        this.getToken() ?
                        <Link to="/logut" className="nav-link">logout</Link> :
                        <Link to="/signup" className="nav-link">signup</Link>
                    }
                </nav>
                <Switch>
                    <Route path={"/signup"} exact render={props => this.getToken() ?
                            <Redirect {...props} to={"/"} /> :
                            <SignupPage ws={this.ws} {...props}/>
                        }
                    />
                    <Route path={"/login"} exact render={props => this.getToken() ?
                            <Redirect {...props} to={"/"} /> :
                            <LoginPage ws={this.ws} {...props}/>
                        }
                    />
                    <Route path={"/logout"} exact render={props => {
                                this.logout();
                                return <Redirect {...props} to={"/login"} />
                            }
                        }
                    />
                    <Route path={"/"} exact render={props => this.getToken() ?
                            <HomePage ws={this.ws} data={this.state.data} {...props} /> :
                            <Redirect to={"/login"} />
                        }
                    />

                    <Route exact path="/*" render={props => <h3>404 Page Not Found</h3>} />
                </Switch>
            </>
        );
    }
}

export default App;
