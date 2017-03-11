import {
    ADD_ITEM,
    EDIT_ITEM,
    LOAD_ITEMS
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
            // Pass it itemID, attrId, Value
            return state;
        case LOAD_ITEMS:
            return action.json;
        default:
            return state;
    }
};

export default items;