//COMPONENTS
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import {createStore} from 'redux';

import workspaceState from '../reducers/rootReducer';
import ViewContainer from './viewContainer';

const initialState = {
    view: 'CHART',
    attributes: [
        {id: 1, name: "size", type_id: 0},
        {id: 2, name: "color", type_id: 0},
        {id: 3, name: "number", type_id: 1}
    ],
    items: [
        {name: "ball 2", "1": "large", "2": "red", "3": -1.32},
        {name: "ball 3", "1": "small", "2": "blue", "3": 3},
        {name: "ball 4", "1": "medium", "2": "green", "3": 8.22}
    ]
}

const store = createStore(workspaceState, initialState);

class Workspace extends React.Component {
    render() {
        return (
            <div id="wrapper">
                <ViewContainer/>
            </div>
        );
    }
}

// ========================================

var workspaceElem = document.getElementById("workspace");

ReactDOM.render(
    <Provider store={store}>
        <Workspace />
    </Provider>,
    workspaceElem
);