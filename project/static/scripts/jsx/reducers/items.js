import {
    ADD_ITEM,
    EDIT_ITEM
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
        default:
            return state;
    }
};

export default items;