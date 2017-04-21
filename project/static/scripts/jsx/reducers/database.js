import {
    ADD_CALL,
    UNDO_CALL,
    REDO_CALL,
    CLEAR_UNDONE,
    CLEAR_CALLS,
    CALL_MADE,
    CHANGE_ID
} from '../actions/actions'

/* {callType: #, args: []}
 * State structure for all the database calls
 */

const database = (state = {calls: [], undone: []}, action) => {
    switch(action.type) {
        case ADD_CALL:
            var newState = {...state,
                calls: [...state.calls], 
                undone: [...state.undone]};
            newState.calls.push({callType: action.callType, args: action.args});
            return newState;

        case UNDO_CALL:
            var newState = {...state, calls: [...state.calls], undone: [...state.undone]};
            var undone = newState.calls.pop();
            newState.undone.push(undone);
            return newState;

        case REDO_CALL:
            var newState = {...state, calls: [...state.calls], undone: [...state.undone]};
            var redone = newState.undone.pop();
            newState.calls.push(redone);
            return newState;

        case CALL_MADE:
            var newState = {...state, calls: [...state.calls], undone: [...state.undone]};
            newState.calls.shift();
            return newState;

        case CLEAR_UNDONE:
            return {...state, calls: [...state.calls], undone: []};

        case CLEAR_CALLS:
            return {calls: [], undone: []};

        case CHANGE_ID:
            var newCalls = state.calls.map((call) => {
                var newArgs = call.args.map((arg) => {
                    if (arg !== action.oldId) {
                        return arg;
                    }

                    return action.newId;
                });
                
                return {
                    ...call,
                    args: newArgs
                }
            });
            return {...state,
            calls: newCalls};

        default:
            return state;
    }
};

export default database;