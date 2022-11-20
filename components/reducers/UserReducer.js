import { UPDATE_DRIVER } from "../actions/UserActions";

const initialState = {
    driver: {
    }
};

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_DRIVER:
            let { key, value } = action.payload;
            console.log(state);
            return { ...state, driver: { ...state.driver, [key]: value } };
        default:
            return state
    }
};

export default userReducer;
