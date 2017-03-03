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
                    <tr>
                        <button id="addButton" className="btn btn-primary"><i className="fa fa-plus" aria-hidden="true"></i></button> 
                    </tr>
                </tbody>
            </table>
        );
    }
}

export default ChartView;