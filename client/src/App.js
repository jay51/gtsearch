import React from "react"
import "./App.css";
import LoginPage from "./LoginPage";

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLogedIn: false,
            data: null,
            error: null
        }
        this.HOST = window.location.origin;
        this.WSHOST = this.HOST.replace(/^http/, "ws");
    }

    componentDidMount() {
        this.ws = new WebSocket(this.WSHOST);
        const token = localStorage.getItem("token")

        const isValidToken = !(token && Date.now() >= token.exp * 1000);
        if (isValidToken) {
            this.setState({isLogedIn: true});
        }

        this.ws.onopen = () => {
            if (isValidToken) {
                const msg = { event: {type: "FETCH_REPOS", payload: {}}, token};
                console.log("sending saved token", msg);
                this.ws.send(JSON.stringify(msg));
            }
        }

        // we sockets response login state should not change the view.
        // maybe only display an alert if try to make a connection without token.
        this.ws.onmessage = (msg) => {
            const json = JSON.parse(msg.data);
            console.log("got message: ", json)
            if (!json.error) {
                // still not sure about this part of the json response
                this.setState({data: json.data});
            }
        }
    }


    getData = async (e) => {
        const msg = { event: {type: "FETCH_REPOS", payload: {}}};
        this.ws.send(JSON.stringify(msg));
    }

    render() {
        if (this.state.isLogedIn) {
            return (
                <div>
                    <h1>YOU ARE LOGED IN</h1>
                    <button onClick={this.getData}>send anohter socket request</button>
                    <div>{ JSON.stringify(this.state.data) || "nothing so far"}</div>
                </div>
            )
        }
        return (
            <div className="App">
                <LoginPage 
                    handleLogin={e => this.setState({isLogedIn: true})}
                    send={(data) => this.ws.send(data)}
                />
            </div>
        );
    }
}

export default App;
