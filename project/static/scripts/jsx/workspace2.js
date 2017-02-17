//COMPONENTS
import React from 'react';
import ReactDOM from 'react-dom';

class Workspace extends React.Component {
    

    render() {
        // var template_data = [
        //     {name: "name"},
        //     {name: "size"},
        //     {name: "color"},
        //     {name: "number"}
        // ];

        var template_data = JSON.parse(this.props.template);

        // var comparison_data = {items: [
        //     {name: "ball 2", size: "large", color: "red", number: -1.32},
        //     {name: "ball 3", size: "small", color: "blue", number: 3},
        //     {name: "ball 4", size: "medium", color: "green", number: 8.22}
        // ]};

        var comparison_data = JSON.parse(this.props.comparison);

        

        return (

            <table className="table table-bordered table-inverse">
                <thead>
                    <tr>
                        <th className="invisible"></th>
                        {comparison_data.items.map(attr =>
                            <th>
                                {attr.name}
                            </th>
                        )}
                    </tr>
                </thead>    
                <tbody>
                    {template_data.map(function(attr) {
                        // Generate <td> column elements in each row
                        var rowCells = comparison_data.items.map(item =>
                            <td>{item[attr.name]}</td>
                        );

                        return( 
                            <tr>
                                <td>{attr.name}</td>
                                {rowCells} 
                            </tr>);
                    })}
                </tbody>
            </table>
            
        );
    }
}

// ========================================

ReactDOM.render(
    <Workspace {...(document.getElementById("workspace").dataset)}/>,
    document.getElementById("workspace")
);