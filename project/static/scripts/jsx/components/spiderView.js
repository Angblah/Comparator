//COMPONENTS
import React from 'react';
// import Radar from 'react-d3-radar';
import {Radar, RadarChart, PolarGrid, Legend, Tooltip, PolarAngleAxis, PolarRadiusAxis} from 'recharts';


class SpiderChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {combined: true};
        this.returnName = this.returnName.bind(this);
    }

    setCombined(isCombined) {
        this.setState({combined: isCombined});
    }

    returnName(name) {
        if (name != "") {
            return name;
        } else {
            return "Untitled";
        }
    }

    render() {
        var rechartData = []
        // {attribute: attr.name, item.id: worth}
        this.props.attributes.map(function(attr) {
            var attribute = {attribute: attr.name};
            // Generate <td> column elements in each row
            this.props.items.map(item =>
                attribute[item.id] = item[attr.id].worth
            );

            // Set each row to be attribute name, then generated column cells
            rechartData.push(attribute);
        }, this);

        var fill = ["#FFEB3B", "#E91E63", "#8D54FF", "#3F51B5", "#00BCD4",
            "#429645", "#EAB107", "#F44336", "#5C35A5",
            "#03A9F4", "#B7FF60"]
        
        var fillIndex = -1;

        console.log(rechartData);

        if (this.state.combined) {
            return (
                <div>
                    <nav className="navbar navbar-toggleable-md navbar-light bg-faded">
                        <ul className="nav nav-pills nav-fill w-100">
                            <li className="nav-item">
                                <a className="nav-link active" href="#">Combined Radars</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link btn-outline-success" href="#" onClick={() => this.setCombined(false)}>Separate Raders</a>
                            </li>
                        </ul>
                    </nav>
                    <div className="d-flex justify-content-center">
                        <RadarChart cx={300} cy={250} outerRadius={200} width={600} height={500} data={rechartData}>
                            {this.props.items.map(function(item, fillIndex) {
                                fillIndex++;
                                return (
                                    <Radar name={this.returnName(item.name)} dataKey={item.id} stroke={fill[fillIndex]} fill={fill[fillIndex]} fillOpacity={0.6}/>
                                )}, this
                            )}
                            <PolarGrid />
                            <Legend />
                            <PolarAngleAxis dataKey="attribute" />
                            <PolarRadiusAxis domain={[0, 12]} axisLine={false} tick={false}/>
                        </RadarChart>
                    </div>
                </div>
            );
        } else {
            return (
                <div>
                    <nav className="navbar navbar-toggleable-md navbar-light bg-faded">
                        <ul className="nav nav-pills nav-fill w-100">
                            <li className="nav-item">
                                <a className="nav-link btn-outline-success" href="#" onClick={() => this.setCombined(true)}>Combined Radars</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link active" href="#">Separate Raders</a>
                            </li>
                        </ul>
                    </nav>

                    <div className="row justify-content-md-center">
                        {this.props.items.map(function(item, fillIndex) {
                            fillIndex++;
                            return (
                                <div className="col-5">
                                    <RadarChart cx={300} cy={250} outerRadius={150} width={600} height={450} data={rechartData}>
                                        <Radar name={this.returnName(item.name)} dataKey={item.id} stroke={fill[fillIndex]} fill={fill[fillIndex]} fillOpacity={0.6}/>
                                        <PolarGrid />
                                        <Legend />
                                        <PolarAngleAxis dataKey="attribute" />
                                        <PolarRadiusAxis domain={[0, 12]} axisLine={false} tick={false}/>
                                    </RadarChart>
                                </div>
                            )}, this
                        )}
                    </div>
                </div>
            );
        }
    }
}

export default SpiderChart;