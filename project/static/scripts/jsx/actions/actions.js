export const ADD_ATTR = 'ADD_ATTR'
export const EDIT_ATTR = 'EDIT_ATTR'
export const ADD_ITEM = 'ADD_ITEM'
export const EDIT_ITEM = 'EDIT_ITEM'
export const EDIT_ITEM_NAME = 'EDIT_ITEM_NAME'
export const CHANGE_VIEW = 'CHANGE_VIEW'

export const addAttr = (id) => {
    //AJAX to get next id
    return {
        type: 'ADD_ATTR'
        //ID then goes here
    }
}

export const editAttr = (id, name) => {
    return {
        type: 'EDIT_ATTR',
        id,
        name
    }
}

export const addItem = () => {
    return {
        type: 'ADD_ITEM'
    }
}

export const editItem = () => {
    return {
        type: 'EDIT_ITEM'
    }
}

export const editItemName = (name) => {
    return {
        type: 'EDIT_ITEM_NAME',
        name
    }
}

export const changeView = (view) => {
    return {
        type: 'CHANGE_VIEW',
        view
    }
}