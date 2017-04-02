//COMPONENTS
import React from 'react';
import {Surface, Group} from '@ecliptic/react-art';
import Circle from '@ecliptic/react-art/shapes/circle';
// import Radar from 'react-d3-radar';
import {Radar, RadarChart, PolarGrid, Legend, PolarAngleAxis, PolarRadiusAxis} from 'recharts';


class ZoomDragCircle extends React.Component {
    constructor(props) {
        super(props);

        this.state = {x: 0, y:0, 
            dragging:false, coords: {},
            scale: 1
        };
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }

    componentDidMount() {
        document.addEventListener('mousemove', this.handleMouseMove, false);
    }

    componentWillUnmount() {
        //Don't forget to unlisten!
        document.removeEventListener('mousemove', this.handleMouseMove, false);
    }

    handleMouseDown(e) {
        this.setState({dragging: true, 
            coords: {x: e.pageX, y: e.pageY}});
    }

    handleMouseUp() {
        this.setState({
            dragging: false,
            coords: {}
        });
    }

    handleMouseMove(e) {
        //If we are dragging
        if (this.state.dragging) {
            e.preventDefault();
            //Get mouse change differential
            var xDiff = this.state.coords.x - e.pageX,
                yDiff = this.state.coords.y - e.pageY;
            //Update to our new coordinates
            this.state.coords.x = e.pageX;
            this.state.coords.y = e.pageY;
            //Adjust our x,y based upon the x/y diff from before
            var x = this.state.x - xDiff,       
                y = this.state.y - yDiff;
            //Re-render
            this.setState({x: x, y: y});  
        }
    }

    isNegative(n) {
        return ((n = +n) || 1 / n) < 0;
    }

    handleScroll(e) {
        var ZOOM_STEP = .03;
            //require the shift key to be pressed to scroll
            if (!e.altKey) {
                return;
            }
        e.preventDefault();
        var direction = (this.isNegative(e.deltaX) && this.isNegative(e.deltaY) ) ? 'down' : 'up';
        var newScale = this.state.scale;
        if (direction == 'up') {
            newScale += ZOOM_STEP;
        } else {
            newScale -= ZOOM_STEP;
        }
        newScale = newScale < 0 ? 0 : newScale;
        this.setState({scale: newScale});
    }

    render() {
        var rechartData = []
        this.props.attributes.map(function(attr) {
            var attribute = {attribute: attr.name};
            // Generate <td> column elements in each row
            this.props.items.map(item =>
                attribute[item.id] = item[attr.id].worth
            );

            // Set each row to be attribute name, then generated column cells
            rechartData.push(attribute);
        }, this);

        console.log(rechartData);

        return (
            <div 
                    onMouseDown={this.handleMouseDown}
                    onMouseUp={this.handleMouseUp}
                    onWheel={this.handleScroll}
            >
                <Surface
                    width={700}
                    height={300}
                >
                    <Group x={this.state.x} y={this.state.y} 
                    scaleX={this.state.scale} scaleY={this.state.scale}>
                        <Circle x={10} y={10} radius={5} fill="#000" />
                    </Group>
                </Surface>

                <RadarChart cx={300} cy={250} outerRadius={150} width={600} height={500} data={rechartData}>
                    {this.props.items.map(item =>
                        <Radar name={item.name} dataKey={item.id} stroke="#8884d8" fill="#8884d8" fillOpacity={0.6}/>
                    )}
                    <PolarGrid />
                    <Legend />
                    <PolarAngleAxis dataKey="attribute" />
                </RadarChart>
            </div>
        );
    }
}

export default ZoomDragCircle;