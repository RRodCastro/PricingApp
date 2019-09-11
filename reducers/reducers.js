import {combineReducers} from 'redux'

const INITITAL_STATE = {
    itemCode: ''
}

const appReducers = (state= INITITAL_STATE, action) => {
    switch (action.type){
        default:
            return state
    }
}

export default combineReducers ({
    appData: appReducers
})