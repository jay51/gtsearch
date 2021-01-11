import React from "react";
import DisplayCode from "./DisplayCode";
import DynamicInput from "./DynamicInput";


class HomePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            query:"",
            repo: {name:"", id: null},
            ignoreCase: false,
            ignoreFiles: [],
            ignoreDirs: [],
        }
        this.repoToAdd = React.createRef();
        this.branchToAdd = React.createRef();
    }

    getData = async (e) => {
        const msg = { event: {type: "FETCH_REPOS", payload: {}}};
        this.props.ws.send(JSON.stringify(msg));
    }

    cloneRepo = async (name, url, branch) => {
        const msg = { event: {
                type: "CLONE_REPO", payload: {
                    name: name,
                    gitUrl: url,
                    branch: branch,
                }
            }
        };
        this.props.ws.send(JSON.stringify(msg));
    }

    search = async (e) => {
        if (!this.state.repo) return;

        this.setState({query: e.target.value}, () => {
            const msg = { event: {
                    type: "GREP_SEARCH",
                    payload: {
                        // NOTE: will need to first fetch all user repos first
                        repoId: this.state.repo.id,
                        query: this.state.query,
                        excludeDir: this.state.ignoreDirs.filter(el => el.activated).map(el => el.name),
                        excludeFile: this.state.ignoreFiles.filter(el => el.activated).map(el => el.name),
                        ignoreCase: this.state.ignoreCase,
                    }
                }
            };

            this.props.ws.send(JSON.stringify(msg));
        });
    }

    ignoreInputHandler = (e, val, inputType) => {
        if (e.code === "Enter") {
            if(inputType === "File") {
                const option = {name: val, activated: true}
                option.id = this.state.ignoreFiles.length;
                this.setState({ignoreFiles: [...this.state.ignoreFiles, option]});
            }
            else if(inputType === "Dir") {
                const option = {name: val, activated: true}
                option.id = this.state.ignoreDirs.length;
                this.setState({ignoreDirs: [...this.state.ignoreDirs, option]});
            }
        }
    }

    deleteInput = (e, id, inputType) => {
        if(inputType === "File") {
            const newBoxes = this.state.ignoreFiles.filter(el => el.id !== id);
            this.setState({ignoreFiles: newBoxes});
        }
        else if(inputType === "Dir") {
            const newBoxes = this.state.ignoreDirs.filter(el => el.id !== id);
            this.setState({ignoreDirs: newBoxes});
        }
    }

    toggleCheckbox = (e, id, inputType) => {
        if(inputType === "File") {
            const newBoxes = this.state.ignoreFiles.map(el => {
                if(el.id === id) {
                    el.activated = !el.activated;
                }
                return el;
            });
            this.setState({ignoreFiles: newBoxes});
        }
        else if(inputType === "Dir") {
            const newBoxes = this.state.ignoreDirs.filter(el => {
                if(el.id === id) {
                    el.activated = !el.activated;
                }
                return el;
            });
            this.setState({ignoreDirs: newBoxes});
        }
    }

    addRepo = async (e) => {
        // send a clone request and then a fetch request
        const url = this.repoToAdd.current.value;
        const name = url.substring(url.lastIndexOf("/")+1);
        console.log(url, name, this.branchToAdd.current.value);
        this.cloneRepo(name, url, this.branchToAdd.current.value)

        const msg = { event: {type: "FETCH_REPOS", payload: {}}};
        this.props.ws.send(JSON.stringify(msg));
    }

    render() {
        console.log("props: ", this.props.data);
        console.log(this.state);
        return (
            <div className="container">
                <button onClick={this.getData}>Get Repos</button>
                <div className="row">

                    <div className="row">
                        <div className="form-group col-10">
                            <input 
                                type="text"
                                value={this.state.query}
                                onChange={this.search}
                                className="form-control mb-3 mt-3 search-btn"
                                placeholder="Search"
                            />
                        </div>

                        <div className="form-group col-2">
                            <select className="form-control mt-3 mb-3"
                                value={this.state.repo.name}
                                onChange={e => this.setState({repo: JSON.parse(e.target.value)})}
                            >
                                {
                                    this.props.repos.map(option =>
                                        (<option value={JSON.stringify(option)}>{option.name}</option>)
                                    )
                                }
                            </select>

                            <div className="form-group">
                                <input
                                    type="text"
                                    ref={this.repoToAdd}
                                    className="form-control mb-3 mt-3"
                                    placeholder="Add repo"
                                />

                                <input
                                    type="text"
                                    ref={this.branchToAdd}
                                    className="form-control mb-3 mt-3"
                                    placeholder="Branch name"
                                />
                                <button onClick={this.addRepo}>Add Repo</button>
                            </div>

                        </div>

                    </div>

                    <div className="row">
                        <div className="col-10">
                            <DisplayCode data={this.props.data}/>
                        </div>

                        {/* configuration bar */}
                        <div className="col-2">
                            <input type="checkbox"
                                className="form-check-input"
                                checked={this.state.ignoreCase}
                                onChange={e => this.setState({ignoreCase: !this.state.ignoreCase})}
                            />
                            <label className="form-check-label">Ignore Case</label>


                            <DynamicInput
                                keyUpHandler={(e, val) => this.ignoreInputHandler(e, val, "File")}
                                toggleCheckbox={(e, id) => this.toggleCheckbox(e, id, "File")}
                                onDelete={(e, id) => this.deleteInput(e, id, "File")}
                                inputs={this.state.ignoreFiles}
                                placeholder={"File to ignore"}
                            />

                            <DynamicInput
                                keyUpHandler={(e, val) => this.ignoreInputHandler(e, val, "Dir")}
                                toggleCheckbox={(e, id) => this.toggleCheckbox(e, id, "Dir")}
                                onDelete={(e, id) => this.deleteInput(e, id, "Dir")}
                                inputs={this.state.ignoreDirs}
                                placeholder={"Dir to ignore"}
                            />
                        </div>

                    </div>
                </div>

            </div>
        );
    }
}

export default HomePage;
