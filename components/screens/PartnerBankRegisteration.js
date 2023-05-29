import "react-native-get-random-values";
import {
  Surface,
  List,
  Portal,
  TextInput,
  Button,
  Text,
} from "react-native-paper";
import { StyleSheet, ScrollView, Pressable, View, Image } from "react-native";
import registerPartner from "../config/registerPartner.json";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { useSelector, useDispatch } from "react-redux";
import { updatePartnerBank } from "../actions/UserActions";
import { BANK_ACCOUNT_PENNY_DROP, BANK_TRANSFER_VERIFICATION } from "@env";
import axios from "axios";
import ErrorDialog from "./ErrorDialog";

//RegisterPartner is the first Screen in Registeration Flow, inside Stack Navigator
//It helps collect the personal, as well as verification details of the customer
//It stores everything inside Store, for global access
//It needs Camera for Driver, and Aadhaar Card Photo Capture

//Image Link

export default function RegisterBankPartner({ setBankRegisteration }) {
  const dispatch = useDispatch();
  const partner = useSelector((store) => store.driver.partner);
  const displayInfo = registerPartner.displayInfo;

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [amountDisabled, setAmountDisabled] = useState(true);
  const [errorDialogVisible, setErrorDialogVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dropDisabled, setDropDisabled] = useState(false);
  const [dropLoading, setDropLoading] = useState(false);
  const [dropSuccessful, setDropSuccessful] = useState(false);
  const [transferReferenceId, setTransferReferenceId] = useState(null);

  const _updatePartner = (key, value) => {
    dispatch(updatePartnerBank({ key, value }));
  };

  const onSubmit = async () => {
    setSubmitLoading(true);
    try {
      let transferVerificationData = await transferVerificationRequest();
      console.log(transferVerificationData);
    } catch (err) {
      console.log(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const onBack = () => {
    setBankRegisteration(false);
  };

  const transferVerificationRequest = async () => {
    let partnerVerificationData = {
      bankDetails: partner.bankDetails,
    };

    try {
      const transferVerificationConfig = {
        method: "post",
        url: BANK_TRANSFER_VERIFICATION,
        headers: {
          "Content-Type": "application/json",
        },
        data: partnerVerificationData,
      };
      const response = await axios(transferVerificationConfig);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw error.response.data;
      } else if (error.request) {
        throw error.message;
      } else {
        throw error.message;
      }
    }
  };

  const onPennyDrop = async () => {
    setDropLoading(true);
    try {
      let pennyDropData = await pennyDropRequest();
      console.log(pennyDropData);
      if (pennyDropData) {
        _updatePartner("reference", pennyDropData.referenceId);
        setAmountDisabled(false);
        setDropSuccessful(true);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setDropLoading(false);
    }
  };

  const pennyDropRequest = async () => {
    let partnerBankData = {
      bankDetails: partner.bankDetails,
      firstName: partner.firstName,
      lastName: partner.lastName,
    };

    try {
      const pennyDropConfig = {
        method: "post",
        url: BANK_ACCOUNT_PENNY_DROP,
        headers: {
          "Content-Type": "application/json",
        },
        data: partnerBankData,
      };
      const response = await axios(pennyDropConfig);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw error.response.data;
      } else if (error.request) {
        throw error.message;
      } else {
        throw error.message;
      }
    }
  };

  useEffect(() => {
    checkFields(partner);
  }, [partner]);

  const checkFields = (partner) => {
    if (
      partner &&
      partner.bankDetails &&
      partner.bankDetails.bankAccountNumber &&
      partner.bankDetails.bankifsc
    ) {
      setDropDisabled(false);
    } else {
      setDropDisabled(true);
    }
  };

  return (
    <View style={styles.container}>
      <ErrorDialog
        visible={errorDialogVisible}
        hideDialog={() => setErrorDialogVisible(false)}
        errorMessage={errorMessage}
      />
      <Portal></Portal>
      {partner && (
        <Surface style={styles.surface} elevation={2}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ marginHorizontal: 10 }}
          >
            <List.Section>
              <List.Subheader>{displayInfo.head.bankingDetails}</List.Subheader>
              <View>
                {Object.keys(displayInfo.body.bankingDetails).map(
                  (key, index) => {
                    return (
                      <View key={index}>
                        <TextInput
                          keyboardType={
                            displayInfo.body.bankingDetails[key].format
                          }
                          value={partner[key]}
                          onChangeText={(input) => _updatePartner(key, input)}
                          label={displayInfo.body.bankingDetails[key].label}
                          style={{ backgroundColor: "#FBFEFB" }}
                          autoCapitalize="characters"
                          mode="outlined"
                          disabled={
                            displayInfo.body.bankingDetails[key].disabled &&
                            amountDisabled
                          }
                        />
                      </View>
                    );
                  }
                )}
              </View>
            </List.Section>
            <List.Section>
              <View style={{ flex: 1, flexDirection: "row" }}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Button
                    icon="step-backward"
                    mode="contained"
                    onPress={() => onBack()}
                    style={{ backgroundColor: "#8B2635" }}
                  >
                    Back
                  </Button>
                </View>
                <View style={{ flex: 1, flexDirection: "column" }}>
                  <View style={{ marginBottom: 10 }}>
                    {!dropSuccessful ? (
                      <Button
                        icon="currency-inr"
                        mode="contained-tonal"
                        onPress={() => onPennyDrop()}
                        loading={dropLoading}
                        disabled={dropDisabled}
                      >
                        Penny Drop
                      </Button>
                    ) : (
                      <Button
                        icon="step-forward"
                        mode="contained"
                        onPress={() => onSubmit()}
                        loading={submitLoading}
                      >
                        Submit
                      </Button>
                    )}
                  </View>
                </View>
              </View>
            </List.Section>
          </ScrollView>
        </Surface>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  surface: {
    flex: 1,
    margin: 10,
    paddingVertical: 10,
  },
  button: {
    flex: 0.5,
    alignSelf: "flex-end",
    marginHorizontal: 10,
    alignSelf: "stretch",
  },
  title: {
    fontSize: 16,
    color: "#A4919B",
  },
  description: {
    fontSize: 18,
  },
  topSection: {
    backgroundColor: "#FAF9F9",
    alignItems: "center",
    padding: 5,
  },
  avatar: {
    width: 96,
    height: 96,
    borderColor: "#4C243B",
    borderWidth: 2,
    justifyContent: "center",
  },
  inlineImage: {
    width: 144,
    height: 144,
    justifyContent: "center",
  },
  inlineElement: {
    flexDirection: "row",
  },
  containerStyle: {
    flex: 0.75,
    margin: 10,
    backgroundColor: "white",
  },
  modalImageStyle: {
    flex: 1,
    resizeMode: "contain",
  },
  cameraButtonStyle: {
    backgroundColor: "white",
    position: "absolute",
    top: 0,
    right: 0,
  },
});
