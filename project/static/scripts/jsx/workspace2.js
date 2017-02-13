import React from 'react';
import ReactDOM from 'react-dom';

var cols = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' }
];

var data = [
    { id: 1, firstName: 'John', lastName: 'Doe' },
    { id: 2, firstName: 'Clark', lastName: 'Kent' }
];

var Table = React.createClass({

    render: function() {
        var headerComponents = this.generateHeaders(),
            rowComponents = this.generateRows();

        return (
            <table>
                <thead> {headerComponents} </thead>
                <tbody> {rowComponents} </tbody>
            </table>
        );
    },

    generateHeaders: function() {
        var cols = this.props.cols;  // [{key, label}]

        // generate our header (th) cell components
        return cols.map(function(colData) {
            return <th key={colData.key}> {colData.label} </th>;
        });
    },

    generateRows: function() {
        var cols = this.props.cols,  // [{key, label}]
            data = this.props.data;

        return data.map(function(item) {
            // handle the column data within each row
            var cells = cols.map(function(colData) {

                // colData.key might be "firstName"
                return <td> {item[colData.key]} </td>;
            });
            return <tr key={item.id}> {cells} </tr>;
        });
    }
});

React.render(<Table cols={cols} data={data}/>, document.getElementById('workspace'));