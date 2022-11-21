import { UPDATE_DRIVER } from "../actions/UserActions";
import { UPDATE_AUTO_DETAILS } from "../actions/UserActions";
import { UPDATE_BANK_DETAILS } from "../actions/UserActions";


const initialState = {
    driver: {
    }
};

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_DRIVER:
            let { key, value } = action.payload;
            return { ...state, driver: { ...state.driver, [key]: value } };
        case UPDATE_BANK_DETAILS:
            return { ...state, driver: { ...state.driver, [action.payload.key]: action.payload.value } };
        case UPDATE_AUTO_DETAILS:
            return { ...state, driver: { ...state.driver, [action.payload.key]: action.payload.value } };
        default:
            return state
    }
};

export default userReducer;
