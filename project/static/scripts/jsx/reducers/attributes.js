import {
    ADD_ATTR,
    EDIT_ATTR,
    LOAD_ATTR,
    EDIT_ITEM_NAME
} from '../actions/actions'

const attributes = (state = [], action) => {
    switch(action.type) {
        // Add an empty attribute
        case ADD_ATTR:
            return [
                ...state,
                {name: "",
                id: action.attrId,
                type_id: 0}
            ];
        // Edit a single attribute
        case EDIT_ATTR:
            var newState = [...state];
            return newState.map((attr, index) => {
                if (attr.id !== action.id) {
                    return attr;
                }

                return {
                    ...attr,
                    name: action.name
                }
            });
        // Load the attributes
        case LOAD_ATTR:
            return action.json;
        default:
            return state;
    }
};

export default attributes;