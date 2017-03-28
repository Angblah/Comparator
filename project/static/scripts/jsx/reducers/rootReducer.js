import {combineReducers} from 'redux'
import undoable from 'redux-undo';
import attributes from './attributes'
import items from './items'
import view from './view'
import id from './id'
import info from './info'

const workspaceState = combineReducers({
    id: id,
    info: info,
    data: undoable(combineReducers({
        view: view,
        attributes: attributes,
        items: items
    }))
});

export default workspaceState;