import React from 'react';
import {connect} from 'react-redux'

class Navbar extends React.Component {

    render() {
        return (
            <nav className="navbar navbar-light navbar-toggleable-sm">
                <div className="navbar-collapse collapse dual-collapse">
                    <ul className="navbar-nav mr-auto">
                        <h1 className="navbar-brand mb-0">{this.props.info.name}</h1>
                    </ul>
                </div>

                <div className="navbar-collapse collapse dual-collapse">
                    <ul className="navbar-nav ml-auto">
                        <li className="nav-item">
                            <a className="nav-link" href="#"><img src="/path/to/image.png"></img></a>
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
)(Navbar)