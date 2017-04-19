import {combineReducers} from 'redux';
import undoable, {distinctState} from 'redux-undo';
import {isEqual} from 'lodash';
import attributes from './attributes';
import items from './items';
import view from './view';

const data = undoable(combineReducers({
        view: view,
        attributes: attributes,
        items: items
    }), 
    {filter: function filterActions(action, currentState, previousState) {
        return !_.isEqual(currentState,previousState); // only add history if states aren't equal
    }});

// function filterActions(action, currentState, previousHistory) {
//     return action.type === SOME_ACTION; // only add to history if action is SOME_ACTION
//   }

// // distinctState helper
// function distinctState() {
//   return function (action, currentState, previousState) {
//     return currentState !== previousState;
//   };
// }

export default data;