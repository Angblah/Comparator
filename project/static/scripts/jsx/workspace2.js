//COMPONENTS
import React from 'react';
import ReactDOM from 'react-dom';

class Workspace extends React.Component {
    

    render() {
        // var table_data = this.props.feed;
        var template_data = [
            {name: "name"},
            {name: "size"},
            {name: "color"},
            {name: "number"}
        ];

        var comparison_data = [
            {name: "ball 2", size: "large", color: "red", number: -1.32},
            {name: "ball 3", size: "small", color: "blue", number: 3},
            {name: "ball 4", size: "medium", color: "green", number: 8.22}
        ];

        return (
            <table className="table table-bordered table-inverse">
                <thead>
                    <tr>
                        <th className="invisible"></th>
                        {comparison_data.map(attr =>
                            <th>
                                {attr.name}
                            </th>
                        )}
                    </tr>
                </thead>    
                <tbody>
                    {comparison_data.map(function(item) {
                        // Generate <td> column elements in each row
                        var rowCells = template_data.map(attr =>
                            <td> {item[attr.name]} </td>
                        );

                        return <tr> {rowCells} </tr>;
                    })}
                </tbody>
            </table>
        );
    }
}

// ========================================

ReactDOM.render(
    <Workspace />,
    document.getElementById("workspace")
);