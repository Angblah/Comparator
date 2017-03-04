import {
    ADD_ITEM,
    EDIT_ITEM
} from '../actions/actions'

const items = (state = [], action) => {
    switch(action.type) {
        case ADD_ITEM:
            return [
                ...state,
                {name: ""}
            ];
        case EDIT_ITEM:
            return state;
        default:
            return state;
    }
};

export default items;