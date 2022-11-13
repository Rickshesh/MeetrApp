import { StyleSheet, ScrollView, View } from 'react-native'
import { Surface, List, TextInput, Button } from 'react-native-paper'
import registerDriver from '../responses/registerDriver.json';

export default function RegisterBank() {

    const displayInfo = registerDriver.displayInfo;

    return (
        <View style={styles.container}>
            <Surface style={styles.surface} elevation={2}>
                <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ margin: 10 }}>
                    <List.Section>
                        <List.Subheader>
                            {displayInfo.head.bankingDetails}
                        </List.Subheader>
                        <Surface>
                            {Object.keys(displayInfo.body.bankingDetails).map((key, index) => {
                                return (
                                    <TextInput key={index} label={displayInfo.body.bankingDetails[key].label} style={{ backgroundColor: "#FBFEFB" }} mode="outlined" />
                                )
                            })}
                        </Surface>
                    </List.Section>
                    <List.Section>
                        <Button icon="step-forward" style={styles.button} mode="contained" onPress={() => { navigation.navigate('Auto'); uploadImageToS3(photo) }}>
                            Next
                        </Button>
                    </List.Section>
                </ScrollView>
            </Surface>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    surface: {
        flex: 1,
        margin: 10
    },
    "button": {
        flex: 0.5,
        alignSelf: "flex-end",
        marginHorizontal: 10
    },
    title: {
        fontSize: 16,
        color: '#A4919B'
    },
    description: {
        fontSize: 18
    },
    topSection: {
        backgroundColor: '#FAF9F9',
        alignItems: 'center',
        padding: 5
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 96 / 2,
    },
    inlineImage: {
        width: 144,
        height: 144,
        resizeMode: 'contain'
    },
    inlineElement: {
        flexDirection: "row",
        justifyContent: "space-around"
    },
    containerStyle: {
        flex: 0.75,
        margin: 10,
        backgroundColor: 'white'
    },
    modalImageStyle: {
        flex: 1,
        resizeMode: 'contain'
    },
    cameraButtonStyle: {
        backgroundColor: 'white',
        position: 'absolute',
        top: 0,
        right: 0
    }
})
