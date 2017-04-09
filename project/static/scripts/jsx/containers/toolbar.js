import React from 'react';
import {connect} from 'react-redux'
import {addAttr, addItem, changeView, exportCSV, saveTemplate, deleteItem, deleteAttr} from '../actions/actions'
import { ActionCreators as UndoActionCreators } from 'redux-undo'

class Toolbar extends React.Component {
    constructor(props) {
        super(props);

        this.copyText = this.copyText.bind(this);
    }

    copyText() {
        var input = document.getElementById("copy-text");
        input.select();
        document.execCommand("copy");
        input.blur();
    }

    render() {
        if (this.props.view === 'CHART') {
            return (
                <div>
                    <div className="btn-toolbar d-flex justify-content-start" role="toolbar" aria-label="Toolbar with button groups">
                        <div className="btn-group mr-2" role="group" aria-label="First group">
                            <button type="button" className="btn btn-secondary" id="addAttrButton" onClick={() => this.props.addAttr(this.props.id)}>Add Attribute</button>
                            <button type="button" className="btn btn-secondary" id="addItemButton" onClick={() => this.props.addItem(this.props.id)}>Add Item</button>
                        </div>

                        <div className="btn-group mr-2" role="group" aria-label="Second group">
                            <button className="btn btn-secondary" onClick={this.props.onUndo} disabled={!(this.props.canUndo)}>
                              <i className="fa fa-undo" aria-hidden="true"></i>
                            </button>
                            <button className="btn btn-secondary" onClick={this.props.onRedo} disabled={!(this.props.canRedo)}>
                              <i className="fa fa-repeat" aria-hidden="true"></i>
                            </button>
                        </div>

                        <div className="btn-group mr-2" role="group" aria-label="Third group">
                            <button id="toggleViewButton" className="btn btn-primary" onClick={() => this.props.changeView('SPIDER')}><i className="fa fa-eye" aria-hidden="true"></i></button>
                        </div>

                        <div className="btn-group mr-2" role="group" aria-label="Fourth group">
                            <div className="dropdown">
                                <button type="button blank-bg" className="btn btn-secondary dropdown-toggle" id="saveDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i className="fa fa-floppy-o" aria-hidden="true"></i></button>
                                <div className="dropdown-menu" aria-labelledby="saveDropdown">
                                    <a className="dropdown-item" href="#" data-toggle="modal" data-target="#saveModal">Comparison</a>
                                    <a className="dropdown-item" href="#" data-toggle="modal" data-target="#saveModal" onClick={() => this.props.saveTemplate(this.props.id, this.props.info.name)}>Template</a>
                                </div>

                                <div className="modal fade" id="saveModal" tabIndex="-1" role="dialog" aria-labelledby="saveModalLabel" aria-hidden="true">
                                    <div className="modal-dialog modal-sm" role="document">
                                        <div className="modal-content">
                                            <div className="modal-body" style={{textAlign: "center"}}>
                                                Save successful!
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="btn-group ml-auto" role="group" aria-label="Extra">
                            <button type="button blank-bg" className="btn btn-secondary" onClick={() => this.props.exportCSV()}><i className="fa fa-file-excel-o" aria-hidden="true"></i> Export as CSV</button>
                            <button type="button blank-bg" className="btn btn-secondary" data-toggle="modal" data-target="#shareModal"><i className="fa fa-share" aria-hidden="true"></i> Share</button>

                            <div className="modal fade" id="shareModal" tabIndex="-1" role="dialog" aria-labelledby="shareModalLabel" aria-hidden="true">
                                <div className="modal-dialog modal-lg" role="document">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title" id="shareModalTitle">Share Your Comparison</h5>
                                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                              <span aria-hidden="true">&times;</span>
                                            </button>
                                          </div>
                                        <div className="modal-body">
                                            <label htmlFor="copy-text">Click the button to copy the link or CTRL+C after selecting the link!</label>
                                            <div className="input-group">
                                                <input id="copy-text" className="form-control" type="text" value={window.location.href} readOnly/>
                                                <span className="input-group-btn">
                                                    <button className="btn btn-primary" type="button" onClick={this.copyText}>Copy <i className="fa fa-clipboard" aria-hidden="true"></i></button>
                                                </span>
                                            </div>
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
        id: state.id,
        info: state.info,
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
        changeView: (view) => {
            dispatch(changeView(view))
        },
        exportCSV: () => dispatch(exportCSV()),
        saveTemplate: (compId, name) => {
            dispatch(saveTemplate(compId, name))
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
)(Toolbar)