import React from "react";
import {Switch, Route, Redirect, Link} from "react-router-dom";

import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import createWS from "./ws";


class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            repos: [],
            error: null,
            authenticated: false,
            wsConnected: false,
        }
        this.HOST = window.location.origin;
        this.WSHOST = this.HOST.replace(/^http/, "ws");
        this.ws = null;
        this.checkAuth();

    }

    removeToken = () => localStorage.removeItem("token");
    getToken = () => localStorage.getItem("token");

    async checkAuth() {
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
                    this.setState({authenticated: true});
                } else {
                    // means token expired
                    this.removeToken();
                    console.log("remove expired token");
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
                    this.setState({data: json.event.payload});
                    break
                case "CLONE_REPO":
                    {
                        const msg = json.error ? "CLONE_REPO Success" : "CLONE_REPO  Failed";
                        alert(msg);
                        console.log("CLONE_REPO: ", json)
                    }
                    break
                default:
                    console.log("unkown event");
            }
        }
        else {
            alert(json.error);
        }
    }

    logout = () => {
        this.removeToken();
        this.setState({authenticated: false});
    }

    render() {
        const {authenticated, wsConnected} = this.state;
        if (authenticated && !wsConnected) {
            this.ws = createWS(this.WSHOST, this.getToken());
            this.ws.onmessage = this._onMessage;
            this.setState({wsConnected: true});
        }

        return (
            <>
                <nav className="nav nav-masthead justify-content-center">
                    <Link to="/" className="nav-link active">Home</Link>
                    <Link to="/login" className="nav-link">login</Link>
                    {
                        this.state.authenticated ?
                        <button onClick={this.logout} className="nav-link btn btn-link">logout</button> :
                        <Link to="/signup" className="nav-link">signup</Link>
                    }
                </nav>
                <Switch>
                    <Route path={"/signup"} exact render={props => this.state.authenticated ?
                            <Redirect {...props} to={"/"} /> :
                            <SignupPage
                                ws={this.ws}
                                cb={()=> this.setState({authenticated: true})}
                                {...props}
                            />
                        }
                    />
                    <Route path={"/login"} exact render={props => this.state.authenticated ?
                            <Redirect {...props} to={"/"} /> :
                            <LoginPage
                                ws={this.ws}
                                cb={()=> this.setState({authenticated: true})}
                                {...props}
                            />
                        }
                    />
                    <Route path={"/logout"} exact render={props => {
                                this.removeToken();
                                // this.setState({authenticated: false});
                            }
                        }
                    />
                    <Route path={"/"} exact render={props => this.state.authenticated ?
                            <HomePage ws={this.ws} data={this.state.data} repos={this.state.repos} {...props} /> :
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
