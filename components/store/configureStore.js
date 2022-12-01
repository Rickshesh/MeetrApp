import { createStore, combineReducers } from 'redux';
import userReducer from '../reducers/UserReducer';


const rootReducer = combineReducers(
    { driver: userReducer }
);

const configureStore = () => {
    return createStore(rootReducer);
}

export default configureStore;