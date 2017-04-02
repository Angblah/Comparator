import React from 'react';
import {connect} from 'react-redux';
import {editName} from '../actions/actions'

class Navbar extends React.Component {
    constructor(props) {
        super(props);
        
        this.toggleEditing = this.toggleEditing.bind(this);
        this.clearEditing = this.clearEditing.bind(this);

        this.state = {editingName: null};
    }

    clearEditing() {
        this.setState({editingName: null});
    }

    toggleEditing() {
        this.setState({editingName: true});
    }

    renderNameOrInput() {
        console.log("Rendering Name or Input");
        console.log(this.state.editingName);
        if (this.state.editingName) {
             return (
                <form className="form-inline">
                    <input
                        ref={input => input && input.focus()}
                        className="form-control"
                        defaultValue={this.props.info.name}
                        onBlur={(evt) => {this.props.editName(evt.target.value); this.clearEditing();}}
                    />
                </form>
             )
        } else {
            return (
                <h1 className="navbar-brand mb-0" onClick={this.toggleEditing}>{this.props.info.name}</h1>
            )
        }
    }

    render() {
        return (
            <nav className="navbar navbar-light navbar-toggleable-sm">
                {this.renderNameOrInput()}

                <div className="navbar-collapse collapse dual-collapse">
                    <ul className="navbar-nav ml-auto">
                        <li className="nav-item">
                            <a className="nav-link" href="/profile"><img src={"/static/img/logo.png"} height="40px"></img></a>
                        </li>
                    </ul>
                </div>
            </nav>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        info: state.info
    };
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        editName: (name) => {
            dispatch(editName(name))
        }
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Navbar)