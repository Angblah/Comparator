//COMPONENTS
import React from 'react';
// import Radar from 'react-d3-radar';
import {AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip} from 'recharts';


class AreaView extends React.Component {
    constructor(props) {
        super(props);

        this.returnName = this.returnName.bind(this);
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

        return (
            <div>
                <AreaChart width={1200} height={400} data={rechartData}
                    margin={{ top: 10, right: 30, left: 3, bottom: 3 }}>
                    <defs>
                        {this.props.items.map(function(item, fillIndex) {
                            fillIndex++;
                            return (
                                <linearGradient id={"color" + item.id} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={fill[fillIndex]} stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor={fill[fillIndex]} stopOpacity={0}/>
                                </linearGradient>
                            )}
                        )}
                    </defs>
                    <XAxis dataKey="attribute" />
                    <YAxis padding={{ bottom: 3 }} tickLine={false} domain={[0, 12]}/>
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    {this.props.items.map(function(item, fillIndex) {
                        fillIndex++;
                        return (
                            <Area type="monotone" name={this.returnName(item.name)} dataKey={item.id} stroke={fill[fillIndex]} fillOpacity={1} fill={"url(#color"+item.id+")"}/>
                        )}, this
                    )}
                </AreaChart>
            </div>
        );
    }
}

export default AreaView;