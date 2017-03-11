import React from 'react';
import {connect} from 'react-redux'
import {addAttr, editAttr, addItem, editItem, editItemName, changeView} from '../actions/actions'
import ChartView from '../components/chartView'
import ZoomDragCircle from '../components/spiderView'

class ViewContainer extends React.Component {
    render() {
        //TODO: Create ViewContainer toggle based on view of state.
        if (this.props.view === 'CHART') {
            return (
                <div>
                    <ChartView items={this.props.items}
                       attributes={this.props.attributes}
                       addAttr={this.props.addAttr}
                       editAttr={this.props.editAttr}
                       addItem={this.props.addItem}
                       editItem={this.props.editItem}
                       editItemName={this.props.editItemName}/>
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
        },
        editItemName: (itemId, value) => {
            dispatch(editItemName(itemId, value))
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