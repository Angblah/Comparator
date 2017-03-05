import React from 'react';
import {connect} from 'react-redux'
import {addAttr, editAttr, addItem, editItem} from '../actions/actions'
import ChartView from '../components/chartView'

class ViewContainer extends React.Component {
    render() {
        //TODO: Create ViewContainer toggle based on view of state.
        return (
            <ChartView items={this.props.items}
                       attributes={this.props.attributes}
                       addAttr={this.props.addAttr}
                       editAttr={this.props.editAttr}
                       addItem={this.props.addItem}
                       editItem={this.props.editItem}/>
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
        editAttr: (id, name) => {
            dispatch(editAttr(id, name))
        },
        addItem: (compId) => {
            dispatch(addItem(compId))
        },
        editItem: (itemId, attrId, value) => {
            dispatch(editItem(itemId, attrId, value))
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ViewContainer)