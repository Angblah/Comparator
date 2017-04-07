//COMPONENTS
import React from 'react';

class ChartView extends React.Component {
    constructor(props) {
        super(props);
        if (this.props.id) {
            this.toggleEditing = this.toggleEditing.bind(this);
            this.clearEditing = this.clearEditing.bind(this);

            this.state = {isGuestView: false};
        } else {
            this.state = {isGuestView: true};
        }

        // TODO: Should eventually extract editing into a reducer
            this.state.editing = {attr: undefined, item: undefined};
    }

    clearEditing() {
        this.setState({editing: {attr: undefined, item: undefined}});
    }

    toggleEditing(attrID, itemID) {
        this.setState({editing: {attr: attrID, item: itemID}});
    }

    renderAttributeOrEditField(attr) {
        if (this.state.editing.attr === attr.id && this.state.editing.item === undefined) {
            if (!this.state.isGuestView) {
                return(
                    <td>
                        <input
                        ref={input => input && input.focus()}
                        className="form-control"
                        defaultValue={attr.name}
                        onBlur={(evt) => {this.props.editAttr(attr.id, evt.target.value); this.clearEditing();}}
                        />
                    </td>
                );
            } else {
                return(
                    <td>
                        <input
                        className="form-control"
                        defaultValue={attr.name}
                        />
                    </td>
                );
            }
        } else {
            if (!this.state.isGuestView) {
                return(
                    <td
                    onClick={() => this.toggleEditing(attr.id, undefined)}
                    key={attr.id}
                    >{attr.name}</td>
                );
            } else {
                return(
                    <td
                    key={attr.id}
                    >{attr.name}</td>
                );
            }

        }
    }

    renderItemOrEditField(item, attrID) {
        if (this.state.editing.attr === attrID && this.state.editing.item === item.id) {
            if (!this.state.isGuestView) {
                return(
                    <td>
                        <input
                        ref={input => input && input.focus()}
                        className="form-control"
                        defaultValue={item[attrID].val}
                        onBlur={(evt) => {this.props.editItem(item.id, attrID, evt.target.value); this.clearEditing();}}
                        />
                    </td>
                );
            } else {
                return(
                    <td>
                        <input
                        className="form-control"
                        defaultValue={item[attrID].val}
                        />
                    </td>
                );
            }
        } else {
            if (item[attrID]) {
                if (!this.state.isGuestView) {
                    return(
                        <td
                        onClick={() => this.toggleEditing(attrID, item.id)}
                        key={item.id+item.id}
                        >{item[attrID].val}</td>
                    );
                } else {
                    return(
                        <td
                        key={item.id+item.id}
                        >{item[attrID].val}</td>
                    );
                }

            } else {
                return( <td></td>);
            }
        }
    }

    renderItemNameOrEditField(item) {
        if (this.state.editing.item === item.id && this.state.editing.attr === undefined) {
            if (!this.state.isGuestView) {
                return(
                    <th>
                        <input
                        ref={input => input && input.focus()}
                        className="form-control"
                        defaultValue={item.name}
                        onBlur={(evt) => {this.props.editItemName(item.id, evt.target.value); this.clearEditing();}}
                        />
                    </th>
                );
            } else {
                return(
                    <th>
                        <input
                        className="form-control"
                        defaultValue={item.name}
                        />
                    </th>
                );
            }
        } else {
            if (!this.state.isGuestView) {
                return(
                    <th
                    onClick={() => this.toggleEditing(undefined, item.id)}
                    key={item.id}
                    >{item.name}</th>
                );
            } else {
                return(
                    <th
                    key={item.id}
                    >{item.name}</th>
                );
            }

        }
    }

    render () {

        const isGuestView = this.state.isGuestView;

        if (!isGuestView) {
            var deleteItems = this.props.items.map(item =>
                <td onClick={() => this.props.deleteItem(item.id)}>
                    <i className="fa fa-minus-circle fa-2x" aria-hidden="true"></i>
                </td>);
        }

        return (
            <div>
                <table className="table table-bordered table-inverse">
                    <thead>
                        
                        <tr>
                            <th></th>
                            {this.props.items.map(item =>
                                this.renderItemNameOrEditField(item)

                                /*<th>
                                    {item.name}
                                </th>*/
                            )}

                            {!isGuestView &&
                            <th onClick={() => this.props.addItem(this.props.id)}><i className="fa fa-plus fa-2x" aria-hidden="true"></i></th>
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.attributes.map(function(attr) {
                            // Generate <td> column elements in each row
                            var rowCells = this.props.items.map(item =>

                                this.renderItemOrEditField(item, attr.id)

                                //<td>{item[attr.id]}</td>
                            );

                            var attrName = this.renderAttributeOrEditField(attr);

                            // Set each row to be attribute name, then generated column cells
                            return(
                                <tr>
                                    {attrName}
                                    {rowCells}
                                    {!isGuestView &&
                                    <td onClick={() => this.props.deleteAttr(attr.id)}><i className="fa fa-minus-circle fa-2x" aria-hidden="true"></i></td>
                                    }
                                </tr>);
                        }, this)}

                        {!isGuestView &&
                            <tr>
                                <td onClick={() => this.props.addAttr(this.props.id)}><i className="fa fa-plus fa-2x" aria-hidden="true"></i></td>
                                {deleteItems}
                                <td></td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}

export default ChartView;