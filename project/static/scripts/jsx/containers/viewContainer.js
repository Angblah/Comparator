import React from 'react';
import {connect} from 'react-redux'
import {addAttr, editAttr, addItem, editItem} from '../actions/actions'

import ChartView from '../components/chartView'



class ViewContainer extends React.Component {
    render() {
        //TODO: Create ViewContainer toggle based on view of state.
        return (
            <ChartView items={this.props.items} attributes={this.props.attributes}/>
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
        addAttr: addAttr,
        editAttr: editAttr,
        addItem: addItem
    }
}

export default connect(mapStateToProps)(ViewContainer)