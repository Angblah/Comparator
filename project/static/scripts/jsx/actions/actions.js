export const ADD_ATTR = 'ADD_ATTR'
export const EDIT_ATTR = 'EDIT_ATTR'
export const DELETE_ATTR = 'DELETE_ATTR'
export const ATTR_ID = 'ATTR_ID'

export const ADD_ITEM = 'ADD_ITEM'
export const EDIT_ITEM = 'EDIT_ITEM'
export const EDIT_ITEM_WORTH = 'EDIT_ITEM_WORTH'
export const EDIT_ITEM_NAME = 'EDIT_ITEM_NAME'
export const DELETE_ITEM = 'DELETE_ITEM'
export const ITEM_ID = 'ITEM_ID'

export const CHANGE_VIEW = 'CHANGE_VIEW'
export const LOAD_ATTR = 'LOAD_ATTR'
export const LOAD_ITEMS = 'LOAD_ITEMS'
export const EDIT_NAME = 'EDIT_NAME'

export const INCREMENT = 'INCREMENT'
export const CLEAR_TIMER = 'CLEAR_TIMER'

export const ADD_CALL = 'ADD_CALL'
export const UNDO_CALL = 'UNDO_CALL'
export const REDO_CALL = 'REDO_CALL'
export const CLEAR_UNDONE = 'CLEAR_UNDONE'
export const CLEAR_CALLS = 'CLEAR_CALLS'
export const CALL_MADE = 'CALL_MADE'
export const CHANGE_ID = 'CHANGE_ID'

export const COPY_COMP = 'COPY_COMP'

var fauxId = -1;

// ATTRIBUTE ACTIONS
// ================================
export function addAttr(compId) {
    return function (dispatch) {
        var attrId = fauxId;
        dispatch(addCall("addAttr", [compId, attrId]));
        dispatch(routeToAddAttr(attrId));
        fauxId--;
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
        dispatch(addCall("editAttr", [id, name]));
        dispatch(routeToEditAttr(id, name));
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
    return function (dispatch) {
        dispatch(addCall("delAttr", [attrId]));
        dispatch(routeToDeleteAttr(attrId));
    }
}

export const routeToDeleteAttr = (attrId) => {
    return {
        type: 'DELETE_ATTR',
        attrId
    }
}

export const routeToAttrId = (oldId, newId) => {
    return {
        type: 'ATTR_ID',
        oldId,
        newId
    }
}

// ITEM ACTIONS
// ================================
export function addItem(compId) {
    // Generate Faux ID
    return function (dispatch) {
        var itemId = fauxId;
        dispatch(addCall("addItem", [compId, itemId]));
        dispatch(routeToAddItem(itemId));
        fauxId--;
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
        dispatch(addCall("editItem", [itemId, attrId, value]));
        dispatch(routeToEditItem(itemId, attrId, value));
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

export function editItemWorth(itemId, attrId, worth) {
    return function (dispatch) {
        dispatch(addCall("editItemWorth", [itemId, attrId, worth]));
        dispatch(routeToEditItemWorth(itemId, attrId, worth));
    }
}

export function routeToEditItemWorth(itemId, attrId, worth) {
    return {
        type: 'EDIT_ITEM_WORTH',
        itemId,
        attrId,
        worth
    }
}

export function editItemName(itemId, value) {
    return function (dispatch) {
        dispatch(addCall("editItemName", [itemId, value]));
        dispatch(routeToEditItemName(itemId, value));
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
        dispatch(addCall("delItem", [itemId]));
        dispatch(routeToDeleteItem(itemId));
    }
}

export const routeToDeleteItem = (itemId) => {
    return {
        type: 'DELETE_ITEM',
        itemId
    }
}

export const routeToItemId = (oldId, newId) => {
    return {
        type: 'ITEM_ID',
        oldId,
        newId
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

export function editName(compId, name) {
    return function (dispatch) {
        dispatch(routeToEditName(name));
        return fetch('/editComparisonName', {
            method: 'POST',
            body: JSON.stringify({
                compId : compId,
                name : name
            })
        })
        .then(response => response.json())
    }
}

export const routeToEditName = (name) => {
    return {
        type: 'EDIT_NAME',
        name
    }
}


// TIMER ACTIONS
// ================================
export function handleTick(time) {
    if (time < 120) {
        return function (dispatch) {
            dispatch(increment());
        }
    } else {
        return function (dispatch) {
            dispatch(makeCalls());
            dispatch(clearTimer());
        }
    }
}

export const increment = () => {
    return {
        type: 'INCREMENT'
    };
}

export const clearTimer = () => {
    console.log("Timer Clearing");
    return {
        type: 'CLEAR_TIMER'
    };
}

// DATABASE ACTIONS AND THUNKS
// ================================
export function changeAttrId(oldId, attrId) {
    return function (dispatch) {
        dispatch(routeToAttrId(oldId, attrId));
        dispatch(changeId(oldId, attrId));
    }
}

export function changeItemId(oldId, itemId) {
    return function (dispatch) {
        dispatch(routeToItemId(oldId, itemId));
        dispatch(changeId(oldId, itemId));
    }
}

export const addCall = (callType, args) => {
    return {
        type: 'ADD_CALL',
        callType,
        args
    }
}

export const undoCall = () => {
    return {
        type: 'UNDO_CALL'
    }
}

export const redoCall = () => {
    return {
        type: 'REDO_CALL'
    }
}

export const clearUndone = () => {
    return {
        type: 'CLEAR_UNDONE'
    }
}

export const clearCalls = () => {
    return {
        type: 'CLEAR_CALLS'
    }
}

export const callMade = () => {
    return {
        type: 'CALL_MADE'
    }
}

export const changeId = (oldId, newId) => {
    return {
        type: 'CHANGE_ID',
        oldId,
        newId
    }
}

export function makeCalls() {
    console.log("Make Calls Called");
    return function(dispatch, getState) {
        var call = getState().database.calls[0];
        console.log(call);
        if (call) {
            var callType = call.callType;
            console.log(callType);
            switch (callType) {
                case "addAttr":
                    dispatch(dbAddAttr(call.args));
                    break;
                case "addItem":
                    dispatch(dbAddItem(call.args));
                    break;
                case "delAttr":
                    dispatch(dbDelAttr(call.args));
                    break;
                case "delItem":
                    dispatch(dbDelItem(call.args));
                    break;
                case "editItemName":
                    dispatch(dbEditItemName(call.args));
                    break;
                case "editItemWorth":
                    dispatch(dbEditItemWorth(call.args));
                    break;
                case "editItem":
                    dispatch(dbEditItem(call.args));
                    break;
                case "editAttr":
                    dispatch(dbEditAttr(call.args));
                    break;
                default:
                    return
            }
        } else {
            dispatch(clearUndone());
        }
    }
}

export function dbAddAttr(call) {
    return function (dispatch, getState) {
        console.log("Making addAttr Call");
        console.log(call);
        console.log(call[0]);
        return fetch('/addComparisonAttr', {
            method: 'POST',
            body: JSON.stringify({
                compId : call[0]
            })
        })
        .then(response => response.json())
        .then(json => dispatch(changeAttrId(call[1], json.attrId)))
        .then(response => dispatch(callMade()))
        .then(response => dispatch(makeCalls()))
    }
}

export function dbAddItem(call) {
    return function (dispatch, getState) {
        console.log("Making addItemCall");
        return fetch('/addComparisonItem', {
            method: 'POST',
            body: JSON.stringify({
                compId : call[0]
            })
        })
        .then(response => response.json())
        .then(json => dispatch(changeItemId(call[1], json.itemId)))
        .then(response => dispatch(callMade()))
        .then(response => dispatch(makeCalls()))
    }
}

export function dbDelAttr(call) {
    return function (dispatch) {
        console.log("Delete Attr Call")
        return fetch('/deleteComparisonAttr', {
            method: 'POST',
            body: JSON.stringify({
                attrId : call[0]
            })
        })
        .then(response => response.json())
        .then(response => dispatch(callMade()))
        .then(response => dispatch(makeCalls()))
    }
}

export function dbDelItem(call) {
    return function (dispatch) {
        console.log("Delete Item Call")
        return fetch('/deleteComparisonItem', {
            method: 'POST',
            body: JSON.stringify({
                itemId : call[0]
            })
        })
        .then(response => response.json())
        .then(response => dispatch(callMade()))
        .then(response => dispatch(makeCalls()))
    }
}

export function dbEditItemName(call) {
    return function (dispatch) {
        console.log("Edit Item Name Call")
        return fetch('/saveComparisonItemName', {
            method: 'POST',
            body: JSON.stringify({
                itemId : call[0],
                value : call[1]
            })
        })
        .then(response => response.json())
        .then(response => dispatch(callMade()))
        .then(response => dispatch(makeCalls()))
    }
}

export function dbEditItemWorth(call) {
    return function (dispatch) {
        console.log("Edit Item Worth Call")
        return fetch('/editItemWorth', {
            method: 'POST',
            body: JSON.stringify({
                itemId : call[0],
                attrId : call[1],
                worth : call[2]
            })
        })
        .then(response => response.json())
        .then(response => dispatch(callMade()))
        .then(response => dispatch(makeCalls()))
    }
}

export function dbEditItem(call) {
    return function (dispatch) {
        console.log("Edit Item Call")
        return fetch('/saveComparisonData', {
            method: 'POST',
            body: JSON.stringify({
                itemId : call[0],
                attrId : call[1],
                value : call[2]
            })
        })
        .then(response => response.json())
        .then(response => dispatch(callMade()))
        .then(response => dispatch(makeCalls()))
    }
}

export function dbEditAttr(call) {
    return function (dispatch) {
        console.log("Edit Attr Call")
        return fetch('/saveComparisonAttributesData', {
            method: 'POST',
            body: JSON.stringify({
                id : call[0],
                name : call[1]
            })
        })
        .then(response => response.json())
        .then(response => dispatch(callMade()))
        .then(response => dispatch(makeCalls()))
    }
}

export function copyComparison(compId, accountId) {
    return function (dispatch) {
        return fetch('/copyComparison', {
            method: 'POST',
            body: JSON.stringify({
                compId : compId,
                accountId : accountId
            })
        })
        .then(response => response.json())
    }
}