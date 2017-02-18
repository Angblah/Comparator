//COMPONENTS
import React from 'react';
import ReactDOM from 'react-dom';

class Workspace extends React.Component {
    constructor(props) {
        super(props);

        // Bind the add attribute handle method
        this.handleAddEvent = this.handleAddEvent.bind(this);

        //Set up state
        this.state = {};
        this.state.template_data = JSON.parse(this.props.template);
        // this.state.template_data = [
        //     {id: 1, name: "size", type_id: 0},
        //     {id: 2, name: "color", type_id: 0},
        //     {id: 3, name: "number", type_id: 1}
        // ];

        this.state.comparison_data = JSON.parse(this.props.comparison);
        // this.state.comparison_data = {
        //     attributes: [
        //         {id: 1, name: "size", type_id: 0},
        //         {id: 2, name: "color", type_id: 0},
        //         {id: 3, name: "number", type_id: 1}
        //     ],
        //     items: [
        //         {name: "ball 2", "1": "large", "2": "red", "3": -1.32},
        //         {name: "ball 3", "1": "small", "2": "blue", "3": 3},
        //         {name: "ball 4", "1": "medium", "2": "green", "3": 8.22}
        // ]};
    }

    // Handle adding attr to template by adding to the state object
    handleAddEvent(evt) {
        var attribute = {
            id: this.state.template_data.length + 1,
            name: "",
            type_id: 0
        }
        this.state.comparison_data.attributes.push(attribute);
        this.state.template_data.push(attribute);
        this.setState(this.state.template_data);
        this.setState(this.state.comparison_data);
    }

    render() {
        var comparison = this.state.comparison_data;

        // Inverse table with blank first block
        return (
            <div id="wrapper">
                <table className="table table-bordered table-inverse">
                    <thead>
                        <tr>
                            <th></th>
                            {comparison.items.map(item =>
                                <th contentEditable='true'>
                                    {item.name}
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {comparison.attributes.map(function(attr) {
                            // Generate <td> column elements in each row
                            var rowCells = comparison.items.map(item =>
                                <td contentEditable='true'>{item[attr.id]}</td>
                            );

                            // Set each row to be attribute name, then generated column cells
                            return(
                                <tr>
                                    <td contentEditable='true'>{attr.name}</td>
                                    {rowCells}
                                </tr>);
                        }, this)}
                    </tbody>
                </table>
                <button id="saveButton" onClick={this.handleAddEvent} className="btn btn-primary"><i className="fa fa-plus" aria-hidden="true"></i></button>
            </div>
        );
    }
}

// ========================================

var workspaceElem = document.getElementById("workspace");

ReactDOM.render(
    <Workspace {...(workspaceElem.dataset)}/>,
    workspaceElem
);