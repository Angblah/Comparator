import {
    ADD_ITEM,
    EDIT_ITEM,
    LOAD_ITEMS,
    EDIT_ITEM_NAME
} from '../actions/actions'

const items = (state = [], action) => {
    switch(action.type) {
        case ADD_ITEM:
            //TODO:: Anything need to be done with item ID?
            // TODO: Apply the same item properties to new one.
            var newItem = {...state.slice(0,0), name: "", id: action.id}
            return [
                ...state,
                newItem
            ];
        case EDIT_ITEM:
            // Pass it itemID, attrId, Value.
            var newState = [...state]
            return newState.map((item) => {
                if (item.id !== action.itemId) {
                    return item;
                }

                return {
                    ...item,
                    [action.attrId]: action.value
                }
            });
        case EDIT_ITEM_NAME:
            var newState = [...state];
            return newState.map((item) => {
                if (item.id !== action.itemId) {
                    return item;
                }

                return {
                    ...item,
                    name: action.name
                }
            });
        case LOAD_ITEMS:
            return action.json;
        default:
            return state;
    }
};

export default items;