import { createStore, combineReducers, applyMiddleware } from 'redux';
import userReducer from '../reducers/UserReducer';
import thunk from 'redux-thunk';


const rootReducer = combineReducers(
    { driver: userReducer }
);

const configureStore = () => {
    return createStore(rootReducer, applyMiddleware(thunk));
}

export default configureStore;