import {
    ADD_ATTR,
    EDIT_ATTR
} from '../actions/actions'

const attributes = (state = [], action) => {
    switch(action.type) {
        case ADD_ATTR:
            console.log(action);
            return [
                ...state,
                {name: "",
                id: 1000,
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
                    ...action.item.name
                }
            });
        default:
            return state;
    }
};

export default attributes;