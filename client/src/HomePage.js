import React from "react"
import "./App.css";

class HomePage extends React.Component {


    getData = async (e) => {
        const msg = { event: {type: "FETCH_REPOS", payload: {}}};
        this.props.ws.send(JSON.stringify(msg));
    }

    cloneRepo = async (e) => {
        const msg = { event: {
                type: "CLONE_REPO", payload: {
                    name: "flask-course",
                    gitUrl:"https://github.com/jay51/flask-course",
                    branch: "master"
                }
            }
        };
        this.props.ws.send(JSON.stringify(msg));
    }

    render() {
        return (
            <div className="App">
                <div>
                    <h2> youre loged in</h2>
                </div>
                <button onClick={this.getData}>Get Repos</button>
                <button onClick={this.cloneRepo}>Clone Repo</button>
            </div>
        );
    }
}

export default HomePage;
