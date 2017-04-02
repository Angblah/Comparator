import {
    ADD_ITEM,
    EDIT_ITEM,
    LOAD_ITEMS,
    EDIT_ITEM_NAME,
    DELETE_ITEM
} from '../actions/actions'

const items = (state = [], action) => {
    switch(action.type) {
        // Add empty Item by copying an old item and updating name and id.
        // TODO: May actually be unnecessary???? (slice not retaining attr id) Further testing needed
        case ADD_ITEM:
            var newItem = [...state.slice(0,1)];
            newItem = JSON.parse(JSON.stringify(newItem[0]));
            for (var key in newItem) {
                if (newItem.hasOwnProperty(key)) {
                    if (key === 'name') {
                        newItem[key] = "";
                    } else if (key === 'id') {
                        newItem[key] = action.id;
                    } else {
                        newItem[key] = {val: "", worth: 1};
                    }
                }
            }
            return [
                ...state,
                newItem
            ];

        // Edit the item
        case EDIT_ITEM:
            // Pass it itemID, attrId, Value. (adds attrId if doesnt exist)
            var newState = [...state]
            return newState.map((item) => {
                if (item.id !== action.itemId) {
                    return item;
                }

                return {
                    ...item,
                    [action.attrId]: {val: action.value}
                }
            });

        // Edit the Item Name
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

        // Delete an Item
        case DELETE_ITEM:
            return state.filter(item => action.itemId != item.id);

        // Load the comparison items to store
        case LOAD_ITEMS:
            return action.json;
        default:
            return state;
    }
};

export default items;