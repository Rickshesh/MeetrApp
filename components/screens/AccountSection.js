import React, { useState } from "react";
import {
  Surface,
  List,
  Portal,
  Modal,
  IconButton,
  Avatar,
  ActivityIndicator,
  Badge,
  Button,
  Text,
} from "react-native-paper";
import {
  StyleSheet,
  ScrollView,
  Pressable,
  View,
  Image,
  Linking,
  Dimensions,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { toggleAccountSection } from "../actions/UserActions";
import { useAuthenticator } from "@aws-amplify/ui-react-native";

export default function AccountSection({ navigation }) {
  const showAccountSection = useSelector(
    (store) => store.driver.showAccountSection
  );
  const dispatch = useDispatch();
  const { signOut, user, toResetPassword, route } = useAuthenticator(
    (context) => [context.user]
  );

  console.log(JSON.stringify(useAuthenticator().toResetPassword));

  return (
    <Portal>
      <Modal
        contentContainerStyle={styles.containerStyle}
        visible={showAccountSection}
        onDismiss={() => dispatch(toggleAccountSection())}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            margin: 20,
          }}
        >
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Avatar.Icon size={100} icon="account" />
          </View>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text variant="titleMedium">{user.attributes.email}</Text>
          </View>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Button mode="outlined" onPress={signOut}>
              {" "}
              Logout{" "}
            </Button>
          </View>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Button
              mode="outlined"
              onPress={() => {
                signOut();
              }}
            >
              {" "}
              Change Password{" "}
            </Button>
          </View>
          <View style={{ flex: 2 }}></View>
        </View>
        <IconButton
          icon="window-close"
          onPress={() => dispatch(toggleAccountSection())}
          style={{
            position: "absolute",
            right: 2,
            top: 2,
            backgroundColor: "white",
            borderWidth: 0.5,
          }}
        />
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 0.8,
    margin: 10,
    backgroundColor: "rgba(255,255,255,1)",
    justifyContent: "center",
    alignItems: "center",
  },
});
