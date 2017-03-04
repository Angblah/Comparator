export const ADD_ATTR = 'ADD_ATTR'
export const EDIT_ATTR = 'EDIT_ATTR'
export const ADD_ITEM = 'ADD_ITEM'
export const EDIT_ITEM = 'EDIT_ITEM'
export const EDIT_ITEM_NAME = 'EDIT_ITEM_NAME'
export const CHANGE_VIEW = 'CHANGE_VIEW'
export const LOAD_ATTR = 'LOAD_ATTR'
export const LOAD_ITEMS = 'LOAD_ITEMS'

import axios from 'axios';

// ATTRIBUTE ACTIONS
// ================================
export function addAttr(compId) {
    return function (dispatch) {
        return axios.post('/addComparisonAttr', {
            compId : compId
        })
        .then(dispatch(routeToAddAttr()))
    }
}

export function routeToAddAttr() {
    return {
        type: 'ADD_ATTR'
    }
}

export const editAttr = (id, name) => {
    return {
        type: 'EDIT_ATTR',
        id,
        name
    }
}

// ITEM ACTIONS
// ================================
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