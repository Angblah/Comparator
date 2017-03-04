import {
    CHANGE_VIEW
} from '../actions/actions'

const view = (state = {view: 'CHART'}, action) => {
    switch(action.type) {
        case CHANGE_VIEW:
            return {view: action.view};
        default:
            return state;
    }
};

export default view;