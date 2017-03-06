import {
    CHANGE_VIEW
} from '../actions/actions'

const view = (state = 'CHART', action) => {
    switch(action.type) {
        case CHANGE_VIEW:
            return action.view;
        default:
            return state;
    }
};

export default view;