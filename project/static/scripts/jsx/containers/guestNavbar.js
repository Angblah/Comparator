import React from 'react';
import {connect} from 'react-redux';
import {editName} from '../actions/actions'

class GuestNavbar extends React.Component {
    render() {
        return (
            <nav className="navbar navbar-light navbar-toggleable-sm">
                <h1 className="navbar-brand mb-0">{this.props.info.name}</h1>

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
        info: state.info
    };
}
export default connect(
    mapStateToProps
)(GuestNavbar)