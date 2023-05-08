// ErrorDialog.js
import React, {useEffect, useState} from 'react';
import {Dialog, Paragraph, Button, Portal, Text} from 'react-native-paper';

const ErrorDialog = ({visible, hideDialog, errorMessage}) => {
  const [error, setError] = useState('');

  useEffect(() => {
    alignErrorMessage(errorMessage);
  });

  const alignErrorMessage = errorMessage => {
    switch (errorMessage) {
      case 'NetworkError':
        setError('Please connect to the Internet');
        break;
      case 'UserLambdaValidationException':
        setError(
          'Unable to Verify the phone number currently, please retry later',
        );
        break;
      case 'IncorrectOTP':
        setError('One Time Password (OTP) is incorrect, please try later');
        break;
      case 'retriveDriverException':
        setError('Error while fetching driverId');
        break;
      default:
        setError(errorMessage);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={hideDialog}>
        <Dialog.Title>Error</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{error}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={hideDialog}>Close</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default ErrorDialog;
