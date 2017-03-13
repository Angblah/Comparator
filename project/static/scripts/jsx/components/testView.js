import React from 'react';
import * as d3 from 'd3';

class ProgressChart extends React.Component {
    constructor(props) {
        super(props);

        this.state={width: 200, height: 200, chartId: 'v_chart', percent: 0};

        this.updateData = this.updateData.bind(this);
    }

    updateData() {
        var value=(Math.floor(Math.random() * (80) + 10))/100;

        this.setState({percent: value});
    }

    render() {
        var color = ['#404F70','#67BAF5','#2d384d'];
 
        var outerRadius=(this.state.height/2)-10;
        var innerRadius=outerRadius-20;
 
        var arc=d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .startAngle(0)
            .endAngle(2*Math.PI);
 
        var arcLine=d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .cornerRadius(20)
            .startAngle(-0.05);
 
        var transform='translate('+this.state.width/2+','+this.state.height/2+')';
        var styleText= {
            'fontSize': '40px'
        };
        return (
            <div>
                <svg id={this.state.chartId} width={this.state.width}
                     height={this.state.height} onClick={this.updateData}>
 
                    <g transform={transform}>
 
                        <path fill={color[0]} d={arc()}></path>
                        <path fill={color[1]} d={arcLine({endAngle:(2*Math.PI)*this.state.percent})}></path>
                        <circle r={innerRadius} cx="0" cy="0"
                                fill={color[2]} fillOpacity="1"/>
                        <text textAnchor="middle" dy="15" dx="5" fill={d3.rgb(color[1]).brighter(2)}
                            style={styleText}>{this.state.percent*100+'%'}</text>
                    </g>
                </svg>
            </div>
        );
    }
}

export default ProgressChart;