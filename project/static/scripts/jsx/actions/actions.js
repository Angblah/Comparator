export const ADD_ATTR = 'ADD_ATTR'
export const EDIT_ATTR = 'EDIT_ATTR'
export const ADD_ITEM = 'ADD_ITEM'
export const EDIT_ITEM = 'EDIT_ITEM'
export const EDIT_ITEM_NAME = 'EDIT_ITEM_NAME'
export const CHANGE_VIEW = 'CHANGE_VIEW'
export const LOAD_ATTR = 'LOAD_ATTR'
export const LOAD_ITEMS = 'LOAD_ITEMS'

// ATTRIBUTE ACTIONS
// ================================
export function addAttr(compId) {
    return function (dispatch) {
        return fetch('/addComparisonAttr', {
            method: 'POST',
            body: JSON.stringify({
                compId : compId
            })
        })
        .then(response => response.json())
        .then(json => dispatch(routeToAddAttr(json.attrId)))
    }
}

export function routeToAddAttr(attrId) {
    return {
        type: 'ADD_ATTR',
        attrId
    }
}

export function editAttr(id, name) {
    return function (dispatch) {
        return fetch('/saveComparisonAttributesData', {
            method: 'POST',
            body: JSON.stringify({
                id : id,
                name : name
            })
        })
        .then(response => response.json())
        .then(json => dispatch(routeToEditAttr(json.id, json.name)))
    }
}

export const routeToEditAttr = (id, name) => {
    return {
        type: 'EDIT_ATTR',
        id,
        name
    }
}

// ITEM ACTIONS
// ================================
export function addItem(compId) {
    return function (dispatch) {
        return fetch('/addComparisonItem', {
            method: 'POST',
            body: JSON.stringify({
                compId : compId
            })
        })
        .then(response => response.json())
        .then(json => dispatch(routeToAddItem(json.itemId)))
    }
}

export function routeToAddItem(itemId) {
    return {
        type: 'ADD_ITEM',
        itemId
    }
}

export function editItem(itemId, attrId, value) {
    return function (dispatch) {
        return fetch('/saveComparisonData', {
            method: 'POST',
            body: JSON.stringify({
                itemId : itemId,
                attrId : attrId,
                value : value
            })
        })
        .then(response => response.json())
        .then(json => dispatch(routeToEditItem(json.itemId, json.attrId, json.value)))
    }
}

export function routeToEditItem(itemId, attrId, value) {
    console.log(itemId);
    console.log(attrId);
    console.log(value);
    return {
        type: 'EDIT_ITEM',
        itemId
    }
}

export const editItemName = (name) => {
    return {
        type: 'EDIT_ITEM_NAME',
        name
    }
}


// WORKSPACE/STATE ACTIONS
// ================================
export const changeView = (view) => {
    return {
        type: 'CHANGE_VIEW',
        view
    }
}


// THUNKS FOR COMPARISON LOAD
// ================================

export const loadAttr = (json) => {
    return {
        type: 'LOAD_ATTR',
        json
    }
}

export const loadItems = (json) => {
    return {
        type: 'LOAD_ITEMS',
        json
    }
}

function loadComp(json) {
    return dispatch => {
        dispatch(loadAttr(json.attributes));
        dispatch(loadItems(json.items));
    }
}

export function fetchComparison() {
    return function (dispatch) {
        return fetch('/getComparisonData')
        .then(response => response.json())
        .then(json =>
            dispatch(loadComp(json))
        )
    }
}