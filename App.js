import "react-native-gesture-handler";
import MainApp from "./components/Main";
import { SafeAreaView } from "react-native";

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MainApp />
    </SafeAreaView>
  );
};

export default App;
