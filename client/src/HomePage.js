import React from "react"

class HomePage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            query:"",
            repoId:"",
            ignoreCase: false,
            ignoreFiles: [],
            ignoreDirs: [],
        }
        this.ignoreFile = React.createRef();
        this.ignoreDir = React.createRef();
    }

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
        this.setState({query: e.target.value}, () => {
            const msg = { event: {
                    type: "GREP_SEARCH",
                    payload: {
                        // NOTE: will need to first fetch all user repos first
                        repoId: 1,
                        query: this.state.query,
                        excludeDir: this.state.ignoreDirs.map(el => el.name),
                        excludeFile: this.state.ignoreFiles.map(el => el.name),
                        ignoreCase: this.state.ignoreCase,
                    }
                }
            };

            this.props.ws.send(JSON.stringify(msg));
        });
    }

    ignoreInputHandler = (e, inputType) => {
        if (e.code === "Enter") {
            // console.log("enter", this.ignoreFile.current.value);
            if(inputType === "File") {
                const option = {name: this.ignoreFile.current.value, activated: true}
                option.id = this.state.ignoreFiles.length;
                this.setState({ignoreFiles: [...this.state.ignoreFiles, option]});
            }
            else if(inputType === "Dir") {
                const option = {name: this.ignoreDir.current.value, activated: true}
                option.id = this.state.ignoreDirs.length;
                this.setState({ignoreDirs: [...this.state.ignoreDirs, option]});
            }
        }
    }

    deleteCheckbox = (e, inputType, id) => {
        if(inputType === "File") {
            const newBoxes = this.state.ignoreFiles.filter(el => el.id !== id);
            this.setState({ignoreFiles: newBoxes});
        }
        else if(inputType === "Dir") {
            const newBoxes = this.state.ignoreDirs.filter(el => el.id !== id);
            this.setState({ignoreDirs: newBoxes});
        }
    }

    toggleCheckbox = (e, inputType, id) => {
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

    render() {
        console.log("props: ", this.props.data);
        return (
            <div className="container">
                <button onClick={this.getData}>Get Repos</button>
                <button onClick={this.cloneRepo}>Clone Repo</button>
                <button onClick={this.search}>Search Repo</button>
                <div className="row">

                    <div className="row">
                        <div className="form-group col-10">
                            <input type="text" value={this.state.query} onChange={this.search} className="form-control mb-3 mt-3 search-btn" placeholder="Search" />
                        </div>

                        <div className="form-group col-2">
                            <select className="form-control mt-3 mb-3" value={this.state.repo} onChange={e => this.setState({repo: e.target.value})}>
                                <option>Repo...</option>
                                <option>next</option>
                            </select>

                            <div className="form-group">
                                <input type="text" className="form-control mb-3 mt-3" placeholder="Add repo" />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-10">
                            {
                                this.props.data.map(search => {
                                    return (
                                        <div className="row">
                                            <div>{search.filePath}</div>
                                            <div>{search.lines.map(l => <div>{l.lineNumber}: {l.code}</div>)}</div>
                                        </div>
                                    )
                                })
                            }
                        </div>

                        <div className="col-2">
                            <input type="checkbox"
                                className="form-check-input"
                                checked={this.state.ignoreCase}
                                onClick={e => this.setState({ignoreCase: !this.state.ignoreCase})}
                            />
                            <label className="form-check-label">Ignore Case</label>

                            <div className="form-group">
                                <input type="text" ref={this.ignoreFile} onKeyUp={ e => this.ignoreInputHandler(e, "File")} className="form-control mb-3 mt-5" placeholder="file to ignore" />
                            </div>
                            {
                                this.state.ignoreFiles.map(el => {
                                    return (
                                        <div className="form-check" key={el.id}>
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                checked={el.activated}
                                                onChange={e => this.toggleCheckbox(e, "File", el.id)}
                                            />
                                            <label className="form-check-label">
                                                {el.name}
                                                <span onClick={e => this.deleteCheckbox(e, "File", el.id)}>X</span>
                                            </label>
                                        </div>
                                    )
                                })
                            }

                            <div className="form-group">
                                <input type="text" ref={this.ignoreDir} onKeyUp={e => this.ignoreInputHandler(e, "Dir")} className="form-control mb-3 mt-3" placeholder="dir to ignore" />
                            </div>

                            {
                                this.state.ignoreDirs.map(el => {
                                    return (
                                        <div className="form-check" key={el.id}>
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                checked={el.activated}
                                                onChange={e => this.toggleCheckbox(e, "Dir", el.id)}
                                            />
                                            <label className="form-check-label">
                                                {el.name}
                                                <span onClick={e => this.deleteCheckbox(e, "Dir", el.id)}>X</span>
                                            </label>
                                        </div>
                                    )
                                })
                            }
                        </div>

                    </div>
                </div>

            </div>
        );
    }
}

export default HomePage;
