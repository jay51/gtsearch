import React from "react"

function Code({lines}) {
    return (
        <div className="row">
            {
                lines.map(l => <div>{`${l.lineNumber}: ${l.code}`}</div>)
            }
        </div>
    )

}


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
                            <div className="row mb-4">
                                <div>{search.filePath}</div>
                                <Code lines={search.lines} />
                            </div>
                        )
                    })
                }
            </>
        )
    }


}

export default DisplayCode;
