import React from 'react';
import {connect} from 'react-redux';
import {editName} from '../actions/actions'

class Navbar extends React.Component {
    constructor(props) {
        super(props);
        
        this.toggleEditing = this.toggleEditing.bind(this);
        this.clearEditing = this.clearEditing.bind(this);

        this.state = {editingName: null};

        var isGuestView = true;
        if (this.props.userId === this.props.info.account_id) {
            isGuestView = false;
        }

    }

    clearEditing() {
        this.setState({editingName: null});
    }

    toggleEditing() {
        this.setState({editingName: true});
    }

    renderNameOrInput() {
        if (this.state.editingName) {
            if (this.props.userId == this.props.info.account_id) {
                 return (
                    <form className="form-inline">
                        <input
                            ref={input => input && input.focus()}
                            className="form-control"
                            defaultValue={this.props.info.name}
                            onBlur={(evt) => {this.props.editName(this.props.id, evt.target.value); this.clearEditing();}}
                        />
                    </form>
                 )
             } else {
                return (
                    <form className="form-inline">
                        <input
                            className="form-control"
                            defaultValue={this.props.info.name}
                        />
                    </form>
                 )
             }
        } else {
            if (this.props.userId == this.props.info.account_id) {
                return (
                    <h1 className="navbar-brand mb-0" onClick={this.toggleEditing}>{this.props.info.name}</h1>
                )
            } else {
                return (
                    <h1 className="navbar-brand mb-0">{this.props.info.name}</h1>
                )
            }
        }
    }

    render() {
        return (
            <nav className="navbar navbar-light navbar-toggleable-sm">
                {this.renderNameOrInput()}
                {this.isGuestView &&
                <button type="button blank-bg" className="btn btn-secondary" data-toggle="modal" data-target="#deleteModal"><i className="fa fa-trash" aria-hidden="true"></i></button>
                }
                <div className="modal fade" id="deleteModal" tabIndex="-1" role="dialog" aria-labelledby="deleteModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="deleteModalTitle">Delete Your Comparison</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>Do you really want to delete your Comparison?</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
                                <a className="btn btn-primary" href={"/deleteComparison/" + this.props.id}>Delete</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="navbar-collapse collapse dual-collapse">
                    <ul className="navbar-nav ml-auto">
                        <li className="nav-item">
                            <a className="nav-link" href="/dashboard"><img src={"/static/img/logo.png"} height="40px"></img></a>
                        </li>
                    </ul>
                </div>
            </nav>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        id: state.id,
        info: state.info
    };
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        editName: (compId, name) => {
            dispatch(editName(compId, name))
        }
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Navbar)