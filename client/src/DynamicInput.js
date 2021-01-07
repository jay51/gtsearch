import React from "react";


export default function DynamicInput(props) {
    const {keyUpHandler, inputs, toggleCheckbox, onDelete, placeholder} = props;
    const refName = React.createRef();
    return (
        <>
            <div className="form-group">
                <input 
                    type="text"
                    ref={refName}
                    onKeyUp={e => keyUpHandler(e, refName.current.value)}
                    className="form-control mb-3 mt-3"
                    placeholder={placeholder}
                />
            </div>

            {
                inputs.map(el => {
                    return (
                        <div className="form-check" key={el.id}>
                            <input
                                type="checkbox"
                                className="form-check-input"
                                checked={el.activated}
                                onChange={e => toggleCheckbox(e, el.id)}
                            />
                            <label className="form-check-label">
                                {el.name}
                                <span onClick={e => onDelete(e, el.id)}>X</span>
                            </label>
                        </div>
                    )
                })
            }
        </>
    );
}
