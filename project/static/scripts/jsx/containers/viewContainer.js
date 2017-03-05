import React from 'react';
import {connect} from 'react-redux'
import {addAttr, editAttr, addItem, editItem} from '../actions/actions'
import ChartView from '../components/chartView'

class ViewContainer extends React.Component {
    render() {
        //TODO: Create ViewContainer toggle based on view of state.
        return (
            <ChartView items={this.props.items} attributes={this.props.attributes} addAttr={this.props.addAttr} addItem={this.props.addItem}/>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        attributes: state.attributes,
        items: state.items
    };
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        addAttr: (compId) => {
            dispatch(addAttr(compId))
        },
        addItem: (compId) => {
            dispatch(addItem(compId))
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ViewContainer)