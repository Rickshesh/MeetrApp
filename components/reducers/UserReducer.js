import { UPDATE_DRIVER } from "../actions/UserActions";
import { UPDATE_AUTO_DETAILS } from "../actions/UserActions";
import { UPDATE_BANK_DETAILS } from "../actions/UserActions";
import { UPDATE_DRIVER_ATTRIBUTE } from "../actions/UserActions";
import { UPDATE_IMAGES } from "../actions/UserActions";
import { RESET_DRIVER } from "../actions/UserActions";
import { TOGGLE_ACCOUNT_SECTION } from "../actions/UserActions"
import { UPDATE_MQTT_DATA } from "../actions/UserActions"


const initialState = {
    driver: {
        identityParameters: {},
        bankingDetails: {},
        autoDetails: {}
    },
    showAccountSection: false,
    mqttData: {}
};

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_DRIVER:
            let { key, value } = action.payload;
            console.log(state);
            return { ...state, driver: { ...state.driver, identityParameters: { ...state.driver.identityParameters, [key]: value } } }
        case UPDATE_BANK_DETAILS:
            return { ...state, driver: { ...state.driver, bankingDetails: { ...state.driver.bankingDetails, [action.payload.key]: action.payload.value } } }
        case UPDATE_AUTO_DETAILS:
            return { ...state, driver: { ...state.driver, autoDetails: { ...state.driver.autoDetails, [action.payload.key]: action.payload.value } } }
        case UPDATE_DRIVER_ATTRIBUTE:
            return { ...state, driver: { ...state.driver, [action.payload.key]: action.payload.value } }
        case UPDATE_IMAGES:
            const { [action.payload.keyobject]: parentValue, ...remainingFields } = state.driver
            const { [action.payload.keyarray]: changedValue, ...remainingUnchanged } = parentValue
            changedValue.uri = action.payload.imageuri
            return { ...state, driver: { ...remainingFields, [action.payload.keyobject]: { ...remainingUnchanged, [action.payload.keyarray]: changedValue } } }
        case RESET_DRIVER:
            return {
                ...state, driver: {
                    identityParameters: {},
                    bankingDetails: {},
                    autoDetails: {}
                }
            }
        case TOGGLE_ACCOUNT_SECTION:
            return {
                ...state, showAccountSection: !state.showAccountSection
            }
        case UPDATE_MQTT_DATA:
            console.log(action.payload);
            return {
                ...state, mqttData: { ...mqttData, [action.payload.key]: action.payload.value }
            }
        default:
            return state
    }
};


export default userReducer;
