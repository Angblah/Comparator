import React from 'react';
import {connect} from 'react-redux';
import { ActionCreators as UndoActionCreators } from 'redux-undo';
import {changeView, 
        exportCSV,
        copyComparison} from '../actions/actions';

class GuestToolbar extends React.Component {
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
                        <div className="btn-group mr-2" role="group" aria-label="Save group">
                            <div className="dropdown">
                                <button type="button blank-bg" className="btn btn-secondary dropdown-toggle" id="saveDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i className="fa fa-floppy-o" aria-hidden="true"></i></button>
                                <div className="dropdown-menu" aria-labelledby="saveDropdown">
                                    <a className="dropdown-item" href="#" data-toggle="modal" data-target="#saveModal">Comparison</a>
                                    <a className="dropdown-item" href="#" data-toggle="modal" data-target="#saveModal">Template</a>
                                </div>

                                <div className="modal fade" id="saveModal" tabIndex="-1" role="dialog" aria-labelledby="saveModalLabel" aria-hidden="true">
                                    <div className="modal-dialog modal-sm" role="document">
                                        <div className="modal-content">
                                            <div className="modal-body" style={{textAlign: "center"}}>
                                                Can't save this comparison. Copy then try again!
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="btn-group mr-2" role="group" aria-label="Change View group">
                            <div className="dropdown">
                                <button type="button blank-bg" className="btn btn-primary dropdown-toggle" id="viewDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Toggle View</button>
                                <div className="dropdown-menu" aria-labelledby="viewDropdown">
                                    <a className="dropdown-item" href="#" onClick={() => this.props.changeView('CHART')}><i className="fa fa-table" aria-hidden="true"></i>  Chart View</a>
                                    <a className="dropdown-item" href="#" onClick={() => this.props.changeView('SPIDER')}><i className="fa fa-bandcamp" aria-hidden="true"></i>  Radar Chart</a>
                                    <a className="dropdown-item" href="#" onClick={() => this.props.changeView('AREA')}><i className="fa fa-area-chart" aria-hidden="true"></i>  Area Chart</a>
                                </div>
                            </div>
                        </div>

                        <div className="btn-group ml-auto" role="group" aria-label="Extra">
                            <button type="button blank-bg" className="btn btn-secondary" onClick={() => this.props.exportCSV()}><i className="fa fa-file-excel-o" aria-hidden="true"></i> Export as CSV</button>
                            <button type="button blank-bg" className="btn btn-secondary" data-toggle="modal" data-target="#shareModal"><i className="fa fa-share" aria-hidden="true"></i> Share</button>

                            <button type="button blank-bg" className="btn btn-secondary" onClick={() => this.props.copyComparison(this.props.id, this.props.userId)}>Copy to My Account</button>
                            
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
                    <div className="btn-group mr-2" role="group" aria-label="Save Group">
                        <div className="dropdown">
                            <button type="button blank-bg" className="btn btn-secondary dropdown-toggle" id="saveDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i className="fa fa-floppy-o" aria-hidden="true"></i></button>
                            <div className="dropdown-menu" aria-labelledby="saveDropdown">
                                <a className="dropdown-item" href="#" data-toggle="modal" data-target="#saveModal">Comparison</a>
                                <a className="dropdown-item" href="#" data-toggle="modal" data-target="#saveModal">Template</a>
                            </div>

                            <div className="modal fade" id="saveModal" tabIndex="-1" role="dialog" aria-labelledby="saveModalLabel" aria-hidden="true">
                                <div className="modal-dialog modal-sm" role="document">
                                    <div className="modal-content">
                                        <div className="modal-body" style={{textAlign: "center"}}>
                                            Can't save this comparison. Copy then try again!
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="btn-group mr-2" role="group" aria-label="Change View">
                        <div className="dropdown">
                            <button type="button blank-bg" className="btn btn-primary dropdown-toggle" id="viewDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Toggle View</button>
                            <div className="dropdown-menu" aria-labelledby="viewDropdown">
                                <a className="dropdown-item" href="#" onClick={() => this.props.changeView('CHART')}><i className="fa fa-table" aria-hidden="true"></i>  Chart View</a>
                                <a className="dropdown-item" href="#" onClick={() => this.props.changeView('SPIDER')}><i className="fa fa-bandcamp" aria-hidden="true"></i>  Radar Chart</a>
                                <a className="dropdown-item" href="#" onClick={() => this.props.changeView('AREA')}><i className="fa fa-area-chart" aria-hidden="true"></i>  Area Chart</a>
                            </div>
                        </div>
                    </div>
                    
                    <div className="btn-group ml-auto" role="group" aria-label="Export and Share">
                            <button type="button blank-bg" className="btn btn-secondary" onClick={() => this.props.exportCSV()}><i className="fa fa-file-excel-o" aria-hidden="true"></i> Export as CSV</button>
                            <button type="button blank-bg" className="btn btn-secondary" data-toggle="modal" data-target="#shareModal"><i className="fa fa-share" aria-hidden="true"></i> Share</button>

                            <button type="button blank-bg" className="btn btn-secondary" onClick={() => this.props.copyComparison(this.props.id, this.props.userId)}>Copy to My Account</button>
                            
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
            );
        }
    }
}

const mapStateToProps = (state) => {
    return {
        id: state.id,
        info: state.info,
        view: state.data.present.view,
    };
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        changeView: (view) => {
            dispatch(changeView(view))
        },
        exportCSV: () => dispatch(exportCSV()),
        copyComparison: (compId, accountId) => {
            dispatch(copyComparison(compId, accountId))
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GuestToolbar)