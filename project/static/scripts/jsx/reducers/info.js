import {
    EDIT_NAME
} from '../actions/actions'

//     info: {
//          account_id: 
//          comment: 
//          date_created: 
//          date_modified: 
//          id:
//          name:
//     }

const info = (state = {}, action) => {
    switch(action.type) {
        case EDIT_NAME:
            return {...state, name: action.name};
        default:
            return state;
    }
};

export default info;