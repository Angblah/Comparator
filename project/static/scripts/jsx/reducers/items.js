import {
    ADD_ITEM,
    EDIT_ITEM,
    LOAD_ITEMS
} from '../actions/actions'

const items = (state = [], action) => {
    switch(action.type) {
        case ADD_ITEM:
            return [
                ...state,
                {id: action.id,
                name: "",
                type_id: 0}
            ]
        case EDIT_ITEM:
            return state;
        case LOAD_ITEMS:
            return action.json;
        default:
            return state;
    }
};

export default items;