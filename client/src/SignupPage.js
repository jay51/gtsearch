import React from "react"
import "./App.css";

class SignupPage extends React.Component {
    constructor(props) {
        super(props);
        this.HOST = window.location.origin;
        this.username = React.createRef();
        this.email = React.createRef();
        this.password = React.createRef();
    }

    handleSignup = e => {
        e.preventDefault();
        const username = this.username.current.value
        const email = this.email.current.value
        const password = this.password.current.value
        if (!username || !email ||!password) {
            alert("missing fields");
            return;
        }

        /*
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
            console.log("login response: ", json);
            // do more things
        } catch(e) {
            console.error(e);
        }
        */
    }

    render() {
        return (
            <div className="container">
                <form>
                    <div className="form-group">
                        <label for="username">Username</label>
                        <input type="text" ref={this.username} className="form-control mt-3" id="username" placeholder="Enter Username" />
                    </div>
                    <div className="form-group">
                        <label for="email">Email address</label>
                        <input type="email" ref={this.email} className="form-control mt-3" id="email" placeholder="Enter email" />
                    </div>

                    <div className="form-group">
                        <label for="password">Password</label>
                        <input type="password" ref={this.password} className="form-control mt-3" id="password" placeholder="Password" />
                    </div>

                    <button type="submit" className="mt-3 btn btn-primary" onClick={this.handleSignup}>
                        Submit
                    </button>
                </form>
            </div>
        );
    }
}

export default SignupPage;
