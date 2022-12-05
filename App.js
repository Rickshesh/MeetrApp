import 'react-native-gesture-handler';
import MainApp from './components/Main';
import Amplify from '@aws-amplify/core';
import config from "./src/aws-exports";
import { withAuthenticator } from 'aws-amplify-react-native';
Amplify.configure(config)

const App = () => {
  return (
    <MainApp />
  );
}

export default withAuthenticator(App)