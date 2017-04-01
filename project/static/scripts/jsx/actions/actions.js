export const ADD_ATTR = 'ADD_ATTR'
export const EDIT_ATTR = 'EDIT_ATTR'
export const DELETE_ATTR = 'DELETE_ATTR'
export const ADD_ITEM = 'ADD_ITEM'
export const EDIT_ITEM = 'EDIT_ITEM'
export const EDIT_ITEM_NAME = 'EDIT_ITEM_NAME'
export const DELETE_ITEM = 'DELETE_ITEM'
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

export function deleteAttr(attrId) {
    console.log(attrId);
    return function (dispatch) {
        return fetch('/deleteComparisonAttr', {
            method: 'POST',
            body: JSON.stringify({
                attrId : attrId
            })
        })
        .then(response => response.json())
        .then(json => dispatch(routeToDeleteAttr(attrId)))
    }
}

export const routeToDeleteAttr = (attrId) => {
    return {
        type: 'DELETE_ATTR',
        attrId
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

export function routeToAddItem(id) {
    return {
        type: 'ADD_ITEM',
        id
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
    return {
        type: 'EDIT_ITEM',
        itemId,
        attrId,
        value
    }
}

export function editItemName(itemId, value) {
    return function (dispatch) {
        return fetch('/saveComparisonItemName', {
            method: 'POST',
            body: JSON.stringify({
                itemId : itemId,
                value : value
            })
        })
        .then(response => response.json())
        .then(json => dispatch(routeToEditItemName(json.itemId, json.value)))
    }
}

export const routeToEditItemName = (itemId, name) => {
    return {
        type: 'EDIT_ITEM_NAME',
        itemId,
        name
    }
}

export function deleteItem(itemId) {
    return function (dispatch) {
        return fetch('/deleteComparisonItem', {
            method: 'POST',
            body: JSON.stringify({
                itemId : itemId
            })
        })
        .then(response => response.json())
        .then(json => dispatch(routeToDeleteItem(itemId)))
    }
}

export const routeToDeleteItem = (itemId) => {
    return {
        type: 'DELETE_ITEM',
        itemId
    }
}


// TOOLBAR FUNCTIONALITIES
// ================================
export function exportCSV() {
     window.location.href = '/csv/' + (window.location.href).split("/")[4];
}

export function saveTemplate(compId, name) {
    return function (dispatch) {
        return fetch('/saveComparisonAsTemplate', {
            method: 'POST',
            body: JSON.stringify({
                compId : compId,
                name : name
            })
        })
        .then(response => response.json())
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