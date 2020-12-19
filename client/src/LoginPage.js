import React from "react"
import "./App.css";

class LoginPage extends React.Component {

    constructor(props) {
        super(props);
        this.HOST = window.location.origin;
        this.email = React.createRef();
        this.password = React.createRef();
    }

    handleLogin = async (e) => {
        e.preventDefault();
        const email = this.email.current.value
        const password = this.password.current.value
        
        try {
            const result = await fetch(this.HOST + "/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({email: email, password: password})
            });
            const json = await result.json();
            console.log(json);

            if (!json.error) {
                const msg = {event: {type: "FETCH_REPO", payload: {name: "repo name"}}, token: json.token};
                this.props.send(JSON.stringify(msg));
                localStorage.setItem("token", json.token);
                this.props.handleLogin();
            }
        } catch(e) {
            console.error(e);
        }
    }

    render() {
        return (
            <div className="App">
                <div>
                    <input type="text" name="email" ref={this.email}/>
                </div>
                <div>
                    <input type="password" name="password" ref={this.password}/>
                </div>
                <button onClick={this.handleLogin}>Submit</button>
            </div>
        );
    }
}

export default LoginPage;