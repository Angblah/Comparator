//COMPONENTS
import React from 'react';

class ChartView extends React.Component {
    constructor(props) {
        super(props);
        
        this.toggleEditing = this.toggleEditing.bind(this);
        this.handleEditEvent = this.handleEditEvent.bind(this);

        this.state = {};
        // TODO: Should eventually extract editing into a reducer
        this.state.editing = {attr: undefined, item: undefined};
    }

    // TODO: Handle the onBlur event to manage the Redux state
    handleEditEvent(itemID, event) {
        var attr;
        var newComp = this.state.comparison_data;
        for (attr of newComp.attributes) {
            if (attr.id === itemID) {
                attr.name = event.target.value;
            }
        }

        this.setState({comparison_data: newComp});
        this.setState({editing: null});
    }

    toggleEditing(attrID, itemID) {
        this.setState({editing: {attr: attrID, item: itemID}});
        console.log({attr: attrID, item: itemID});
    }

    renderAttributeOrEditField(attr) {
        if (this.state.editing.attr === attr.id && this.state.editing.item === undefined) {
            return(
                <td>
                    <input 
                    className="form-control"
                    defaultValue={attr.name}
                    onBlur={(evt) => this.props.editAttr(attr.id, evt.target.value)}
                    />
                </td>
            );
        } else {
            return(
                <td
                onClick={() => this.toggleEditing(attr.id, undefined)}
                key={attr.id}
                >{attr.name}</td>
            );
        }
    }

    renderItemOrEditField(item, attrID) {
        if (this.state.editing.attr === attrID && this.state.editing.item === item.id) {
            return(
                <td>
                    <input 
                    className="form-control"
                    defaultValue={item[attrID]}
                    />
                </td>
            );
        } else {
            return(
                <td
                onClick={() => this.toggleEditing(attrID, item.id)}
                key={item.id+item.id}
                >{item[attrID]}</td>
            );
        }
    }

    renderItemNameOrEditField(item) {
        if (this.state.editing.item === item.id && this.state.editing.attr === undefined) {
            return(
                <th>
                    <input 
                    className="form-control"
                    defaultValue={item.name}
                    />
                </th>
            );
        } else {
            return(
                <th
                onClick={() => this.toggleEditing(undefined, item.id)}
                key={item.id}
                >{item.name}</th>
            );
        }
    }

    render () {

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
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.attributes.map(function(attr) {
                            // Generate <td> column elements in each row
                            var rowCells = this.props.items.map(item =>

                                this.renderItemOrEditField(item, attr.id)

                                //<td>{item[attr.id]}</td>
                            );

                            var attr = this.renderAttributeOrEditField(attr);

                            // Set each row to be attribute name, then generated column cells
                            return(
                                <tr>
                                    {attr}
                                    {rowCells}
                                </tr>);
                        }, this)}
                    </tbody>
                </table>
                <button id="addAttrButton" className="btn btn-primary" onClick={() => this.props.addAttr(12)}><i className="fa fa-plus" aria-hidden="true"></i></button>
                <button id="addItemButton" className="btn btn-primary" onClick={() => this.props.addItem(12)}><i className="fa fa-plus" aria-hidden="true"></i></button>

            </div>
        );
    }
}

export default ChartView;