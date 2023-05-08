// ErrorDialog.js
import React, {useEffect, useState} from 'react';
import {Dialog, Paragraph, Button, Portal} from 'react-native-paper';

const InformationDialog = ({visible, hideDialog, message}) => {
  const [informationMessage, setInformationMessage] = useState('');
  const [informationTitle, setInformationTitle] = useState('');

  useEffect(() => {
    alignInformationMessage(message);
  });

  const alignInformationMessage = errorMessage => {
    switch (errorMessage) {
      case 'PaymentPending':
        setInformationMessage(
          'Pending dues are over Rs 600. Please clear the payment first',
        );
        setInformationTitle('E-Rickshaw not started');
        break;
      case 'OutOfGeoFence':
        setInformationMessage(
          'Your E-Rickshaw is out of City Limits, to prevent, E-Rickshaw has been turned off',
        );
        setInformationTitle('E-Rickshaw not started: Out of Geo Limits');
        break;
      case 'RickshawOutOfRange':
        setInformationMessage(
          'Unable to reach out to E-Rickshaw, please move closer',
        );
        setInformationTitle('E-Rickshaw not nearby');
        break;
      case 'NotConnectedLast2Days':
        setInformationMessage(
          'The Internet has not been activated since last 2 days, please activate internet, then proceed',
        );
        setInformationTitle('Internet Inactive');
        break;
      default:
        setInformationMessage(errorMessage);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={hideDialog}>
        <Dialog.Title>
          {informationTitle != '' ? informationTitle : 'Meetr Says...'}
        </Dialog.Title>
        <Dialog.Content>
          <Paragraph>{informationMessage}</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={hideDialog}>Close</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default InformationDialog;
