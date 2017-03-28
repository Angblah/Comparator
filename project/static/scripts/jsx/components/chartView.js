//COMPONENTS
import React from 'react';

class ChartView extends React.Component {
    constructor(props) {
        super(props);
        
        this.toggleEditing = this.toggleEditing.bind(this);
        this.clearEditing = this.clearEditing.bind(this);

        this.state = {};
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
                    ref={input => input && input.focus()}
                    className="form-control"
                    defaultValue={item[attrID]}
                    onBlur={(evt) => {this.props.editItem(item.id, attrID, evt.target.value); this.clearEditing();}}
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
                    ref={input => input && input.focus()}
                    className="form-control"
                    defaultValue={item.name}
                    onBlur={(evt) => {this.props.editItemName(item.id, evt.target.value); this.clearEditing();}}
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
            </div>
        );
    }
}

export default ChartView;