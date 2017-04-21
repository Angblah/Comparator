import {combineReducers} from 'redux';
import data from './data'
import id from './id';
import info from './info';
import database from './database'
import timer from './timer'

const workspaceState = combineReducers({
    id: id,
    info: info,
    data: data,
    database: database,
    timer: timer
});

export default workspaceState;