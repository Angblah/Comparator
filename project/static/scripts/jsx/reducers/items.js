import {
    ADD_ITEM,
    EDIT_ITEM,
    LOAD_ITEMS
} from '../actions/actions'

const items = (state = [], action) => {
    switch(action.type) {
        case ADD_ITEM:
            //TODO:: Anything need to be done with item ID?
            return [
                ...state,
                {name: ""}
            ];
        case EDIT_ITEM:
            return state;
        case LOAD_ITEMS:
            return action.json;
        default:
            return state;
    }
};

export default items;