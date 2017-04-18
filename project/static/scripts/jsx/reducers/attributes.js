import {
    ADD_ATTR,
    EDIT_ATTR,
    DELETE_ATTR,
    LOAD_ATTR,
    EDIT_ITEM_NAME,
    ATTR_ID
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

        // Delete an attribute
        case DELETE_ATTR:
            return state.filter(attribute => action.attrId != attribute.id);

        // Update the id of the attribute
        case ATTR_ID:
            var newState = [...state];
            return newState.map((attr) => {
                if (attr.id !== action.oldId) {
                    return attr;
                }

                return {
                    ...attr,
                    id: action.newId
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