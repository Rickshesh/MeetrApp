import { StyleSheet, ScrollView, View } from 'react-native'
import { Surface, List, TextInput, Button } from 'react-native-paper'
import registerDriver from '../responses/registerDriver.json';
import { useSelector, useDispatch } from 'react-redux';
import { updateAutoDetails } from "../actions/UserActions";


export default function RegisterBank({ navigation }) {

    const dispatch = useDispatch();
    const driver = useSelector((store) => store.driver);

    const displayInfo = registerDriver.displayInfo;

    const _updateAutoDetails = (key, value) => {
        dispatch(updateAutoDetails({ key, value }))
    }

    const onPrevious = async () => {
        console.log(driver);
        navigation.navigate('Bank');
    }

    const onSubmit = async () => {
        console.log(driver);
        navigation.navigate('Driver');
    }

    return (
        <View style={styles.container}>
            <Surface style={styles.surface} elevation={2}>
                <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ margin: 10 }}>
                    <List.Section>
                        <List.Subheader>
                            {displayInfo.head.autoDetails}
                        </List.Subheader>
                        <Surface>
                            {Object.keys(displayInfo.body.autoDetails).map((key, index) => {
                                return (
                                    <TextInput key={index}
                                        value={driver.driver[key]}
                                        onChangeText={text => _updateAutoDetails(key, text)}
                                        label={displayInfo.body.autoDetails[key].label} style={{ backgroundColor: "#FBFEFB" }} mode="outlined" />
                                )
                            })}
                        </Surface>
                    </List.Section>
                    <List.Section flexDirection="row">
                        <Button icon="step-backward" style={styles.button} mode="contained" onPress={onPrevious}>
                            Previous
                        </Button>
                        <Button icon="step-forward" style={styles.button} mode="contained" onPress={onSubmit}>
                            Submit
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
        backgroundColor: "rgb(158, 42, 155)"
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
