import {
    ADD_ATTR,
    EDIT_ATTR,
    LOAD_ATTR
} from '../actions/actions'

const attributes = (state = [], action) => {
    switch(action.type) {
        case ADD_ATTR:
            return [
                ...state,
                {name: "",
                id: action.attrId,
                type_id: 0}
            ];
        case EDIT_ATTR:
            let array = [...state];
            return array.map((item, index) => {
                if (item.id !== action.id) {
                    return item;
                }

                return {
                    ...item,
                    ...action.name
                }
            });
        case LOAD_ATTR:
            return action.json;
        default:
            return state;
    }
};

export default attributes;