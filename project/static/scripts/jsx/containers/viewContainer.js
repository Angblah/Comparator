import React from 'react';
import { ActionCreators as UndoActionCreators } from 'redux-undo';
import {connect} from 'react-redux';
import {isEqual} from 'lodash';
import Slider from 'rc-slider';
import {addItem, addAttr, editAttr, editItem, editItemWorth, editItemName, changeView, deleteAttr, deleteItem, makeCalls, handleTick, copyComparison} from '../actions/actions';
import ChartView from '../components/chartView';
import SpiderChart from '../components/spiderView';
import AreaView from '../components/areaView';

class ViewContainer extends React.Component {
    constructor(props) {
        super(props);

        this.sidebar = this.sidebar.bind(this);
        this.returnName = this.returnName.bind(this);
    }

    componentDidMount() {
        if (this.props.userId == this.props.info.account_id || this.props.userId == 0) {
            setInterval(() => this.props.handleTick(this.props.timer), 1000);
            window.addEventListener('beforeunload', this.props.makeCalls);
        }
    }

    componentWillUnmount() {
        if (this.props.userId == this.props.info.account_id || this.props.userId == 0) {
            console.log("Component Unmounting");
            this.props.makeCalls();
            window.addEventListener('removeEventListener', this.props.makeCalls);
        }
    }

    shouldComponentUpdate(nextProp) {
        var isEqual = false;

        if (_.isEqual(this.props.attributes, nextProp.attributes) &&
            _.isEqual(this.props.items, nextProp.items) &&
            _.isEqual(this.props.view, nextProp.view)) {
            isEqual = true;
        }

        return !isEqual;
    }

    returnName(name) {
        if (name != "") {
            return name;
        } else {
            return "Untitled";
        }
    }

    sidebar() {
        const marks = {
            0: <strong>0</strong>,
            5: '5',
            10: <strong>10</strong>
        };

        return (
            <nav className="col-2 bg-faded sidebar">
                {this.props.items.map(function(item) {
                    var itemAttr = this.props.attributes.map(function(attr) {
                        if (item[attr.id].val) {
                            return(
                            <div className="nav-item">
                                <div className="container mb-3">
                                    <span className="nav-link pl-0"><strong>{attr.name + ": "}</strong>{item[attr.id].val}</span>
                                    <Slider min={0} max={10} step={1} marks={marks} defaultValue={item[attr.id].worth} onAfterChange={(value) => this.props.editItemWorth(item.id, attr.id, value)}/>
                                </div>
                            </div>
                            );
                        }
                    }, this);
                    return(
                        <ul className="nav nav-pills flex-column">
                            <h3 className="mb-0">
                                <span className="nav-link collapsed pb-1" href={"#submenu" + item.id} data-toggle="collapse" data-target={"#submenu" + item.id}>{this.returnName(item.name)}  <i className="fa fa-sort-desc" aria-hidden="true"></i></span>
                            </h3>
                            <div className="collapse" id={"submenu" + item.id} aria-expanded="false">
                                {itemAttr}
                            </div>
                        </ul>
                    ); 
                }, this)}
            </nav>
        );
    }

    render() {
        //TODO: Create ViewContainer toggle based on view of state.
        if (this.props.userId == this.props.info.account_id) {  
            if (this.props.view === 'SPIDER') {
                return (
                    <div className="container-fluid" id="viewContainer">
                        <div className="row" id="viewRow">
                            {this.sidebar()}
                            <div className="col-10">
                                <SpiderChart items={this.props.items}
                                attributes={this.props.attributes}/>
                            </div>
                        </div>
                    </div>
                );
            } else if (this.props.view === 'AREA') {
                return (
                    <div className="container-fluid" id="viewContainer">
                        <div className="row" id="viewRow">
                            {this.sidebar()}
                            <div className="col-10">
                                <AreaView items={this.props.items}
                                attributes={this.props.attributes}/>
                            </div>
                        </div>
                    </div>
                );
            } else {
                return (
                    <div className="container-fluid" id="viewContainer">
                        <div className="row" id="viewRow">
                            {this.sidebar()}
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
            }
        } else {
            if (this.props.view === 'SPIDER') {
                return (
                    <div className="container-fluid" id="viewContainer">
                        <div className="row" id="viewRow">
                            <SpiderChart items={this.props.items}
                            attributes={this.props.attributes}/>
                        </div>
                    </div>
                );
            } else if (this.props.view === 'AREA') {
                return (
                    <div className="container-fluid" id="viewContainer">
                        <div className="row" id="viewRow">
                            <AreaView items={this.props.items}
                            attributes={this.props.attributes}/>
                        </div>
                    </div>
                );
            } else {
                return (
                    <div className="container-fluid" id="viewContainer">
                        <div className="row" id="viewRow">
                            <div className="container col-10 pt-3">
                                <ChartView items={this.props.items}
                                attributes={this.props.attributes}/>
                            </div>
                        </div>
                        
                    </div>
                );
            }
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
        copyComparison: (compId, accountId) => {
            dispatch(copyComparison(compId, accountId))
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