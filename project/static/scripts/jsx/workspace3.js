//COMPONENTS
import React from 'react';
import ReactDOM from 'react-dom';

//import PanZoomElement from 'react-pan-zoom-element';
import Zoom from 'react-zoom';

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

        const overlay = <div style={{
            backgroundColor: 'blue',
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            zIndex: 99,
        }} />;

        return (

            <div>
                <Zoom
                    isVisible={true}
                    width="50%"
                    height="auto"
                    overlay={overlay}
                    zIndex={999}
                >
                    <div className="row">
                        <div className="card-deck">
                        <div className="card">
                            <div className="card-block">
                            <h4 className="card-title">Card title</h4>
                            <p className="card-text">This is a longer card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
                            <p className="card-text"><small className="text-muted">Last updated 3 mins ago</small></p>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-block">
                            <h4 className="card-title">Card title</h4>
                            <p className="card-text">This card has supporting text below as a natural lead-in to additional content.</p>
                            <p className="card-text"><small className="text-muted">Last updated 3 mins ago</small></p>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-block">
                            <h4 className="card-title">Card title</h4>
                            <p className="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This card has even longer content than the first to show that equal height action.</p>
                            <p className="card-text"><small className="text-muted">Last updated 3 mins ago</small></p>
                            </div>
                        </div>
                        </div>
                    </div>
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
                </Zoom>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Workspace />,
    document.getElementById("workspace")
);