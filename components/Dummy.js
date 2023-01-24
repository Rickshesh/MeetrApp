import { Amplify, PubSub, Auth } from 'aws-amplify';
import { AWSIoTProvider } from '@aws-amplify/pubsub';
import { View } from "react-native"
import { Button } from 'react-native-paper';
import { useEffect } from 'react';


const publishTopic = async () => {
    await PubSub.publish('1234-abcd-9876/workitem', { msg: 'Hello to all subscribers!' }, { provider: 'AWSIoTProvider' })
        .then(response => console.log('Publish response:', response))
        .catch(err => console.log('Publish Pub Err:', err));
}


// Apply plugin with configuration

export default function Dummy() {

    return (
        <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
            <Button mode="contained" onPress={async () => await publishTopic()} >
                Press to Publish
            </Button>
        </View>
    )

}

export const getCurrentCredentials = () => (
    new Promise((resolve, reject) => {
        Auth.currentCredentials()
            .then(creds => resolve(creds))
            .catch(error => reject(error));
    })
);
