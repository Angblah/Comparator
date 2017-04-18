import React from 'react';
import { ActionCreators as UndoActionCreators } from 'redux-undo'
import {connect} from 'react-redux'
import Slider from 'rc-slider';
import {addItem, addAttr, editAttr, editItem, editItemWorth, editItemName, changeView, deleteAttr, deleteItem, makeCalls, handleTick} from '../actions/actions'
import {START_TIMER} from 'redux-timer-middleware';
import ChartView from '../components/chartView'
import ZoomDragCircle from '../components/spiderView'
import ProgressChart from '../components/testView'

class ViewContainer extends React.Component {
    componentDidMount() {
        //setInterval(() => this.props.handleTick(this.props.timer), 1000);
    }

    componentWillUnmount() {
        console.log("Component Unmounting");
        this.props.makeCalls();
    }

    shouldComponentUpdate() {
        return true;
    }

    render() {
        //TODO: Create ViewContainer toggle based on view of state.
        if (this.props.view === 'CHART' &&  this.props.userId == this.props.info.account_id || this.props.userId == 0) {
            return (
                <div className="container-fluid">
                    <div className="row">
                        <nav className="col-2 bg-faded sidebar">
                            {this.props.items.map(function(item) {
                                var itemAttr = this.props.attributes.map(function(attr) {
                                    if (item[attr.id].val) {
                                        return(
                                        <div className="nav-item">
                                            <div className="container">
                                                <a className="nav-link" href="#">{item[attr.id].val}</a>
                                                <Slider min={0} max={10} step={1} dots defaultValue={item[attr.id].worth} onAfterChange={(value) => this.props.editItemWorth(item.id, attr.id, value)}/>
                                            </div>
                                        </div>
                                        );
                                    }
                                }, this);
                                return(
                                    <ul className="nav nav-pills flex-column">
                                        <h3 className="mb-0">
                                            <a className="nav-link collapsed" href={"#submenu" + item.id}  data-toggle="collapse" data-target={"#submenu" + item.id}>{item.name}  <i className="fa fa-sort-desc" aria-hidden="true"></i></a>
                                        </h3>
                                        <div className="collapse" id={"submenu" + item.id} aria-expanded="false">
                                            {itemAttr}
                                        </div>
                                    </ul>
                                ); 
                            }, this)}
                        </nav>
                        <div className="container col-10 pt-3">
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
                    </div>
                </div>
            );
        } else if (this.props.view === 'CHART' &&  this.props.userId != this.props.info.account_id) {
            return (
                <div>
                    <ChartView items={this.props.items}
                       attributes={this.props.attributes}/>
                    <span/>
                </div>
            );
        } else {
            return (
                <div className="container-fluid">
                    <div className="row">
                        <nav className="col-2 bg-faded sidebar">
                            {this.props.items.map(function(item) {
                                var itemAttr = this.props.attributes.map(function(attr) {
                                    if (item[attr.id].val) {
                                        return(
                                        <div className="nav-item">
                                            <a className="nav-link" href="#">{item[attr.id].val}</a>
                                            <Slider min={0} max={10} step={1} dots defaultValue={item[attr.id].worth} onAfterChange={(value) => this.props.editItemWorth(item.id, attr.id, value)}/>
                                        </div>
                                        );
                                    }
                                }, this);
                                return(
                                    <ul className="nav nav-pills flex-column">
                                        <h3>{item.name}</h3>
                                        {itemAttr}
                                    </ul>
                                ); 
                            }, this)}
                        </nav>
                        <div className="col-10">
                            <ZoomDragCircle items={this.props.items}
                            attributes={this.props.attributes}/>
                            <ProgressChart/>
                            <span/>
                        </div>
                    </div>
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
        timer: state.timer,
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
        editItemWorth: (itemId, attrId, worth) => {
            dispatch(editItemWorth(itemId, attrId, worth))
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
        onUndo: () => {
            dispatch(UndoActionCreators.undo())
        },
        onRedo: () => {
            dispatch(UndoActionCreators.redo())
        },
        makeCalls: () => {
            dispatch(makeCalls())
        },
        handleTick: (time) => {
            dispatch(handleTick(time))
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ViewContainer)