import React from 'react';
import { ActionCreators as UndoActionCreators } from 'redux-undo'
import {connect} from 'react-redux'
import {addAttr, editAttr, addItem, editItem, editItemName, changeView} from '../actions/actions'
import ChartView from '../components/chartView'
import ZoomDragCircle from '../components/spiderView'
import ProgressChart from '../components/testView'

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

                    <p>
                        <button onClick={this.props.onUndo} disabled={!(this.props.canUndo)}>
                          Undo
                        </button>
                        <button onClick={this.props.onRedo} disabled={!(this.props.canRedo)}>
                          Redo
                        </button>
                      </p>
                </div>
            );
        } else {
            return (
                <div>
                    <ZoomDragCircle/>
                    <ProgressChart/>
                    <span/>
                    <button id="toggleViewButton" className="btn btn-primary" onClick={() => this.props.changeView('CHART')}>Toggle View</button>
                </div>
            );
        }
    }
}

const mapStateToProps = (state) => {
    return {
        attributes: state.present.attributes,
        items: state.present.items,
        view: state.present.view,
        canUndo: state.past.length > 0,
        canRedo: state.future.length > 0
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
        },
        onUndo: () => dispatch(UndoActionCreators.undo()),
        onRedo: () => dispatch(UndoActionCreators.redo())
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ViewContainer)