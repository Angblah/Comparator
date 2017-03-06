import {
    ADD_ATTR,
    EDIT_ATTR,
    LOAD_ATTR
} from '../actions/actions'

const attributes = (state = [], action) => {
    switch(action.type) {
        // Add an empty attribute
        case ADD_ATTR:
            // TODO: Deal with IDs
            return [
                ...state,
                {name: "",
                id: 1000,
                type_id: 0}
            ];
        // Edit a single attribute
        case EDIT_ATTR:
            let array = [...state];
            return array.map((item, index) => {
                if (item.id !== action.id) {
                    return item;
                }

                return {
                    ...item,
                    ...action.item.name
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