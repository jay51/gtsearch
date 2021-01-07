import React from "react"

class DisplayCode extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
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
            </>
        )
    }


}

export default DisplayCode;
