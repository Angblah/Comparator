import React from 'react';
import {Modal} from 'react-bootstrap';
import {connect} from 'react-redux'
import {addAttr, addItem, changeView, exportCSV} from '../actions/actions'
import { ActionCreators as UndoActionCreators } from 'redux-undo'

class Toolbar extends React.Component {
    render() {
        if (this.props.view === 'CHART') {
            return (
                <div>
                    <div className="btn-toolbar d-flex justify-content-start" role="toolbar" aria-label="Toolbar with button groups">
                        <div className="btn-group mr-2" role="group" aria-label="First group">
                            <button type="button" className="btn btn-secondary" id="addAttrButton" onClick={() => this.props.addAttr(12)}>Add Attribute</button>
                            <button type="button" className="btn btn-secondary" id="addItemButton" onClick={() => this.props.addItem(12)}>Add Item</button>
                        </div>

                        <div className="btn-group mr-2" role="group" aria-label="Second group">
                            <button type="button" className="btn btn-secondary" onClick={this.props.onUndo} disabled={!(this.props.canUndo)}>
                              Undo
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={this.props.onRedo} disabled={!(this.props.canRedo)}>
                              Redo
                            </button>
                        </div>

                        <div className="btn-group mr-2" role="group" aria-label="Third group">
                            <button id="toggleViewButton" className="btn btn-primary" onClick={() => this.props.changeView('SPIDER')}>Toggle View</button>
                        </div>

                        <div className="btn-group mr-2" role="group" aria-label="Fourth group">
                            <div className="dropdown">
                                <button type="button blank-bg" className="btn btn-secondary dropdown-toggle" id="saveDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Save as</button>
                                <div className="dropdown-menu" aria-labelledby="saveDropdown">
                                    <a className="dropdown-item" href="#">Comparison</a>
                                    <a className="dropdown-item" href="#">Template</a>
                                </div>
                            </div>
                        </div>

                        <div className="btn-group ml-auto" role="group" aria-label="Extra">
                            <button type="button blank-bg" className="btn btn-secondary" onClick={() => this.props.exportCSV()}>Export as CSV</button>
                            <button type="button blank-bg" className="btn btn-secondary" data-toggle="modal" data-target="#myModal">Share</button>

                            <div className="modal fade" id="myModal" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                <div className="modal-dialog" role="document">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title" id="shareModalTitle">Share Your Comparison</h5>
                                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                              <span aria-hidden="true">&times;</span>
                                            </button>
                                          </div>
                                        <div className="modal-body">
                                            {window.location.href}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="btn-toolbar d-flex justify-content-start" role="toolbar" aria-label="Toolbar with button groups">
                    <div className="btn-group mr-2" role="group" aria-label="Third group">
                        <button id="toggleViewButton" className="btn btn-primary" onClick={() => this.props.changeView('CHART')}>Toggle View</button>
                    </div>
                </div>
            );
        }
    }
}

const mapStateToProps = (state) => {
    return {
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
        addItem: (compId) => {
            dispatch(addItem(compId))
        },
        changeView: (view) => {
            dispatch(changeView(view))
        },
        exportCSV: () => dispatch(exportCSV()),
        onUndo: () => dispatch(UndoActionCreators.undo()),
        onRedo: () => dispatch(UndoActionCreators.redo())
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Toolbar)