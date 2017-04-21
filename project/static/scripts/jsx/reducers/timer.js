import {
    INCREMENT,
    CLEAR_TIMER
} from '../actions/actions'

const timer = (state = 0, action) => {
    switch (action.type) {
        case INCREMENT:
            return state + 1;
        case CLEAR_TIMER:
            return 0;
        default:
            return state;
    }
}

export default timer;