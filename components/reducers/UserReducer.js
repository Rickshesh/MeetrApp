import { UPDATE_DRIVER } from "../actions/UserActions";
import { UPDATE_AUTO_DETAILS } from "../actions/UserActions";
import { UPDATE_BANK_DETAILS } from "../actions/UserActions";
import { UPDATE_DRIVER_ID } from "../actions/UserActions";


const initialState = {
    driver: {
        identityParameters: {},
        bankingDetails: {},
        autoDetails: {}
    }
};

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_DRIVER:
            let { key, value } = action.payload;
            return { ...state, driver: { ...state.driver, identityParameters: { ...state.driver.identityParameters, [key]: value } } }
        case UPDATE_BANK_DETAILS:
            return { ...state, driver: { ...state.driver, bankingDetails: { ...state.driver.bankingDetails, [action.payload.key]: action.payload.value } } }
        case UPDATE_AUTO_DETAILS:
            return { ...state, driver: { ...state.driver, autoDetails: { ...state.driver.autoDetails, [action.payload.key]: action.payload.value } } }
        case UPDATE_DRIVER_ID:
            return { ...state, driver: { ...state.driver, [action.payload.key]: action.payload.value } }
        default:
            return state
    }
};


export default userReducer;
