import {combineReducers} from 'redux'
import attributes from './attributes'
import items from './items'
import view from './view'

const workspaceState = combineReducers({
    view: view,
    attributes: attributes,
    items: items
});

export default workspaceState;