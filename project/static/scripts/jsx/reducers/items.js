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
            console.log(action)
            // Pass it itemID, attrId, Value.
            var newState = [...state].forEach(function (item){
                    if (item.id == action.itemId) {
                        item[action.attrId] = action.value;
                    }
                });
            return newState;
        case LOAD_ITEMS:
            return action.json;
        default:
            return state;
    }
};

export default items;