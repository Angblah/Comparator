import React from 'react';
import {connect} from 'react-redux'
import {addAttr, editAttr, addItem, editItem, changeView} from '../actions/actions'
import ChartView from '../components/chartView'
import ZoomDragCircle from '../components/spiderView'

class ViewContainer extends React.Component {
    render() {
        //TODO: Create ViewContainer toggle based on view of state.
        if (this.props.view === 'CHART') {
            return (
                <div>
                    <ChartView items={this.props.items} attributes={this.props.attributes} addAttr={this.props.addAttr} addItem={this.props.addItem}/>
                    <span/>
                    <button id="toggleViewButton" className="btn btn-primary" onClick={() => this.props.changeView('SPIDER')}>Toggle View</button>
                </div>
            );
        } else {
            return (
                <div>
                    <ZoomDragCircle/>
                    <span/>
                    <button id="toggleViewButton" className="btn btn-primary" onClick={() => this.props.changeView('CHART')}>Toggle View</button>
                </div>
            );
        }
    }
}

const mapStateToProps = (state) => {
    return {
        attributes: state.attributes,
        items: state.items,
        view: state.view
    };
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        addAttr: () => {
            dispatch(addAttr())
        },
        addItem: () => {
            dispatch(addItem())
        },
        changeView: (view) => {
            dispatch(changeView(view))
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ViewContainer)