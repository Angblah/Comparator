import {combineReducers} from 'redux';
import data from './data'
import id from './id';
import info from './info';

const workspaceState = combineReducers({
    id: id,
    info: info,
    data: data
});

export default workspaceState;