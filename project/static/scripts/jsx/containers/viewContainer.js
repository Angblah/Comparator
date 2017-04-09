import React from 'react';
import { ActionCreators as UndoActionCreators } from 'redux-undo'
import {connect} from 'react-redux'
import Slider from 'rc-slider';
import {addItem, addAttr, editAttr, editItem, editItemName, changeView, deleteAttr, deleteItem} from '../actions/actions'
import ChartView from '../components/chartView'
import ZoomDragCircle from '../components/spiderView'
import ProgressChart from '../components/testView'

class ViewContainer extends React.Component {
    render() {
        //TODO: Create ViewContainer toggle based on view of state.
        if (this.props.view === 'CHART') {
            return (
                <div>
                    <nav className="col-sm-3 col-md-2 hidden-xs-down bg-faded sidebar">
                        {this.props.items.map(function(item) {
                            var itemAttr = this.props.attributes.map(function(attr) {
                                if (item[attr.id].val) {
                                    return(
                                    <div className="nav-item">
                                        <a className="nav-link" href="#">{item[attr.id].val}</a>
                                        <Slider min={0} max={10} step={1} dots defaultValue={item[attr.id].worth}/>
                                    </div>
                                    );
                                }
                            });
                            return(
                                <ul className="nav nav-pills flex-column">
                                    <h3>{item.name}</h3>
                                    {itemAttr}
                                </ul>
                            ); 
                        }, this)}
                    </nav>
                    <ChartView items={this.props.items}
                       attributes={this.props.attributes}
                       id={this.props.id}
                       editAttr={this.props.editAttr}
                       editItem={this.props.editItem}
                       editItemName={this.props.editItemName}
                       deleteAttr={this.props.deleteAttr}
                       deleteItem={this.props.deleteItem}
                       addAttr={this.props.addAttr}
                       addItem={this.props.addItem}/>
                    
                </div>
            );
        } else {
            return (
                <div>
                    <ZoomDragCircle items={this.props.items}
                       attributes={this.props.attributes}/>
                    <ProgressChart/>
                    <span/>
                </div>
            );
        }
    }
}

const mapStateToProps = (state) => {
    return {
        id: state.id,
        info: state.info,
        attributes: state.data.present.attributes,
        items: state.data.present.items,
        view: state.data.present.view,
        canUndo: state.data.past.length > 0,
        canRedo: state.data.future.length > 0
    };
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        addAttr: (compId) => {
            dispatch(addAttr(compId))
        },
        addItem: (compId) => {
            dispatch(addItem(compId))
        },
        editAttr: (id, name) => {
            dispatch(editAttr(id, name))
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
        deleteItem: (itemId) => {
            dispatch(deleteItem(itemId))
        },
        deleteAttr: (attrId) => {
            dispatch(deleteAttr(attrId))
        },
        onUndo: () => dispatch(UndoActionCreators.undo()),
        onRedo: () => dispatch(UndoActionCreators.redo())
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ViewContainer)