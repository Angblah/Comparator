import {combineReducers} from 'redux'
import undoable from 'redux-undo';
import attributes from './attributes'
import items from './items'
import view from './view'

const workspaceState = undoable(combineReducers({
    view: view,
    attributes: attributes,
    items: items
}));

export default workspaceState;