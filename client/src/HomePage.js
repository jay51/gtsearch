import React from "react"

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
                    branch: "dev"
                }
            }
        };
        this.props.ws.send(JSON.stringify(msg));
    }

    search = async (e) => {
        const msg = { event: {
                type: "GREP_SEARCH", payload: {
                    repoName: "flask-course",
                    query:"flask",
                    excludeDir : [".git"],
                    excludeFile : [".gitignore", "requirements.txt"],
                    ignoreCase: true,
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
                <button onClick={this.search}>Search Repo</button>
            </div>
        );
    }
}

export default HomePage;
