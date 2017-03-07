//COMPONENTS
import React from 'react';

class ChartView extends React.Component {
    constructor(props) {
        super(props);
        
        // this.toggleEditing = this.toggleEditing.bind(this);
        // this.handleAddEvent = this.handleAddEvent.bind(this);

        this.state = {};
        this.state.editing = null;
    }

    // handleEditEvent(itemID, event) {
    //     var attr;
    //     var newComp = this.state.comparison_data;
    //     for (attr of newComp.attributes) {
    //         if (attr.id === itemID) {
    //             attr.name = event.target.value;
    //         }
    //     }

    //     this.setState({comparison_data: newComp});
    //     this.setState({editing: null});
    // }

    // toggleEditing(itemID) {
    //     this.setState({editing: itemID});
    // }

    renderAttributeOrEditField(item) {
        if (this.state.editing === item.id) {
            return(
                <td>
                    <input 
                    className="form-control"
                    defaultValue={item.name}
                    //onBlur={(evt) => this.props.editAttr(item.id, "testName")}
                    />
                </td>
            );
        } else {
            return(
                <td
                key={item.id}
                >{item.name}</td>
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
                                <th>
                                    {item.name}
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.attributes.map(function(attr) {
                            // Generate <td> column elements in each row
                            var rowCells = this.props.items.map(item =>
                                <td>{item[attr.id]}</td>
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