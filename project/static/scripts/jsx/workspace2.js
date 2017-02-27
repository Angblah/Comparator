//COMPONENTS
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

class Workspace extends React.Component {
    constructor(props) {
        super(props);

        // Bind the add attribute handle method
        this.handleAddEventAttr = this.handleAddEventAttr.bind(this);
        this.handleAddEventItem = this.handleAddEventItem.bind(this);
        this.toggleEditing = this.toggleEditing.bind(this);

        this.getComparisonData = this.getComparisonData.bind(this);
        this.saveComparisonAttributesData = this.saveComparisonAttributesData.bind(this);

        //Set up state
        this.state = {};
        this.state.template_data = JSON.parse(this.props.template);
        // this.state.template_data = [
        //     {id: 1, name: "size", type_id: 0},
        //     {id: 2, name: "color", type_id: 0},
        //     {id: 3, name: "number", type_id: 1}
        // ];

        this.state.comparison_data = JSON.parse(this.props.comparison);
        //  this.state.comparison_data = {
        //      attributes: [
        //          {id: 1, name: "size", type_id: 0},
        //          {id: 2, name: "color", type_id: 0},
        //          {id: 3, name: "number", type_id: 1}
        //      ],
        //      items: [
        //          {name: "ball 2", "1": "large", "2": "red", "3": -1.32},
        //          {name: "ball 3", "1": "small", "2": "blue", "3": 3},
        //          {name: "ball 4", "1": "medium", "2": "green", "3": 8.22}
        //  ]};
    }

    handleEditEvent(itemID, event) {
        var attr;
        var newComp = this.state.comparison_data;
        for (attr of newComp.attributes) {
            if (attr.id === itemID) {
                attr.name = event.target.value;
            }
        }

        this.setState({comparison_data: newComp});
        this.saveComparisonAttributesData(itemID, event.target.value);
        this.setState({editing: null});
    }

    toggleEditing(itemID) {
        this.setState({editing: itemID});
    }

    renderAttributeOrEditField(item) {
        if (this.state.editing === item.id) {
            return(
                <td>
                    <input 
                    className="form-control"
                    defaultValue={item.name}
                    onBlur={(evt) => this.handleEditEvent(item.id, evt)}
                    />
                </td>
            );
        } else {
            return(
                <td
                onClick={() => this.toggleEditing(item.id)}
                key={item.id}
                >{item.name}</td>
            );
        }
    }

    //Fetch data from the server
    //TODO:: Call this when workspace is initially loaded, pass in template/comparison_id
    getComparisonData() {
        $.ajax({
          url: '/getComparisonData',
          dataType: 'json',
          success: (data) => {
            this.state.comparison_data = data;
            this.setState(this.state.comparison_data);
          },
          error: (xhr, status, err) => {
            console.error('/getComparisonData', status, err.toString());
          }
        });
    }

    //Save edited comparison attributes fields
    saveComparisonAttributesData(id, name) {
        $.ajax({
            type: 'POST',
            url: '/saveComparisonAttributesData',
            data: {id: id, name: name},
            success: (data) => {
                this.state.message = data;
            },
        });
    }

    //Save edited comparison info fields
    saveComparisonData(item_id, attr_id, value) {
        $.ajax({
            type: 'POST',
            url: '/saveComparisonData',
            data: {itemId: item_id, attrId: attr_id, value: value},
            success: (data) => {
                this.state.message = data;
            },
        });
    }

    // Handle adding attr to template by adding to the state object
    handleAddEventAttr(evt) {
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

    // Handle adding item to template by adding to the state object
    handleAddEventItem(evt) {
        var item = {
            name: ""
        }
        var i;
        console.log(this.state);
        for (i = 0; i < this.state.comparison_data.attributes.length ; i++) {
            item[(this.state.comparison_data.attributes[i]).id] = "";
        }
        this.state.comparison_data.items.push(item);
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
                            {this.state.comparison_data.items.map(item =>
                                <th>
                                    {item.name}
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.comparison_data.attributes.map(function(attr) {
                            // Generate <td> column elements in each row
                            var rowCells = this.state.comparison_data.items.map(item =>
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
                <button id="addAttrButton" onClick={this.handleAddEventAttr} className="btn btn-primary"><i className="fa fa-plus" aria-hidden="true"></i></button>
                <br/>
                <button id="addItemButton" onClick={this.handleAddEventItem} className="btn btn-primary"><i className="fa fa-plus" aria-hidden="true"></i></button>
                <br/>
                <button id="getComparisonDataButton" onClick={this.getComparisonData} className="btn btn-primary">Get Comparison Data</button>
                <br/>
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