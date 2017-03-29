import React from 'react';
import {connect} from 'react-redux'

class Navbar extends React.Component {

    render() {
        return (
            <nav className="navbar navbar-light bg-faded">
                <h1 className="navbar-brand mb-0">{this.props.info.name}</h1>
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