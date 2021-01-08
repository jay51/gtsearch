import React from "react"

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
            console.log("login response: ", json);

            if (!json.error) {
                // NOTE: will rerender App.js which will authenticate socket
                // and rerender correct route
                localStorage.setItem("token", json.token);
                this.props.cb();
            }
        } catch(e) {
            console.error(e);
        }
    }

    render() {
        return (
            <div className="container">
                <form>
                    <div className="form-group">
                        <label for="username">Username</label>
                        <input type="text" ref={this.email} className="form-control mt-3" id="username" placeholder="Enter Username" />
                    </div>

                    <div className="form-group">
                        <label for="password">Password</label>
                        <input type="password" ref={this.password} className="form-control mt-3" id="password" placeholder="Password" />
                    </div>

                    <button type="submit" className="mt-3 btn btn-primary" onClick={this.handleLogin}>
                        Submit
                    </button>
                </form>
            </div>
        );
    }
}

export default LoginPage;
