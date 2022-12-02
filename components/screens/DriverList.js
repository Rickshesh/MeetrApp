import * as React from 'react'
import { Surface, List, Portal, Modal, IconButton, Avatar, ActivityIndicator } from 'react-native-paper'
import { StyleSheet, ScrollView, Pressable, View, Image, Text } from 'react-native'

export default function DriverList() {

    const [isLoading, setLoading] = React.useState(true)


    const getUsers = async () => {

        fetch('https://ri6c0kl11e.execute-api.ap-south-1.amazonaws.com/beta/getuserlist') //S3 Link for Json
            .then((response) => response.json())
            .then((data) => console.log(data))
            .catch((error) => console.error(error))
            .finally(() => setLoading(false));

    }

    React.useEffect(() => {
        getUsers();
    }, [])

    return (
        <View style={styles.container}>

            {isLoading ? <Surface style={[styles.surface, { justifyContent: "center", alignItems: "center" }]}><ActivityIndicator animating={true} /></Surface> :
                (<Surface style={[styles.surface]} elevation={2}>

                    <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} style={styles.container}>

                        <Surface style={[styles.listitem, styles.paddingHorizontal]} elevation={2}>
                            <View style={{ flex: 1, margin: 5 }}>
                                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                    <Image resizeMode="contain" style={styles.avatar} source={{ uri: "https://s3-ap-south-1.amazonaws.com/testbucketpiinfo/registerDriverImages%2Fe8441df4-05b7-48a5-87ea-cfdeb4714fd0.jpg" }} />
                                </View>
                            </View>
                            <View style={{ flex: 2, margin: 5 }}>
                                <View style={{ flex: 1, justifyContent: "center", paddingVertical: 5 }}>
                                    <View style={{ flex: 2, justifyContent: "flex-end" }}>
                                        <Text style={{ fontWeight: "500", fontSize: 20 }}>
                                            Rickshesh Manchanda
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1, justifyContent: "flex-end" }}>
                                        <Text style={{ fontWeight: "300", fontSize: 15 }}>
                                            Amount Due: Rs 300
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{ flex: 0.5, margin: 5 }}>
                                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                    <IconButton icon="phone-in-talk" mode="contained" />
                                </View>
                            </View>
                        </Surface>

                        <Surface style={[styles.listitem, styles.paddingHorizontal]} elevation={2}>

                            <Image resizeMode="contain" style={styles.avatar} source={{ uri: "https://s3-ap-south-1.amazonaws.com/testbucketpiinfo/registerDriverImages%2Fe8441df4-05b7-48a5-87ea-cfdeb4714fd0.jpg" }} />

                        </Surface>

                        <Surface style={[styles.listitem, styles.paddingHorizontal]} elevation={2}>

                            <Image resizeMode="contain" style={styles.avatar} source={{ uri: "https://s3-ap-south-1.amazonaws.com/testbucketpiinfo/registerDriverImages%2Fe8441df4-05b7-48a5-87ea-cfdeb4714fd0.jpg" }} />

                        </Surface>

                        <Surface style={[styles.listitem, styles.paddingHorizontal]} elevation={2}>

                            <Image resizeMode="contain" style={styles.avatar} source={{ uri: "https://s3-ap-south-1.amazonaws.com/testbucketpiinfo/registerDriverImages%2Fe8441df4-05b7-48a5-87ea-cfdeb4714fd0.jpg" }} />

                        </Surface>

                        <Surface style={[styles.listitem, styles.paddingHorizontal]} elevation={2}>

                            <Image resizeMode="contain" style={styles.avatar} source={{ uri: "https://s3-ap-south-1.amazonaws.com/testbucketpiinfo/registerDriverImages%2Fe8441df4-05b7-48a5-87ea-cfdeb4714fd0.jpg" }} />

                        </Surface>


                        <Surface style={[styles.listitem, styles.paddingHorizontal]} elevation={2}>

                            <Image resizeMode="contain" style={styles.avatar} source={{ uri: "https://s3-ap-south-1.amazonaws.com/testbucketpiinfo/registerDriverImages%2Fe8441df4-05b7-48a5-87ea-cfdeb4714fd0.jpg" }} />

                        </Surface>

                    </ScrollView>
                </Surface>)
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    surface: {
        flex: 1,
        margin: 10,
    },
    listitem: {
        height: 100,
        margin: 10,
        flexDirection: 'row'
    },
    avatar: {
        height: 72,
        width: 72,
        borderRadius: 72 / 2
    },
    paddingHorizontal: {
        paddingHorizontal: 10
    },
    setFontSizeOne: {
        fontSize: 15 // Define font size here in Pixels
    },
    setFontSizeTwo: {
        fontSize: 20 // Define font size here in Pixels
    },
    setFontSizeThree: {
        fontSize: 25 // Define font size here in Pixels
    },
    setFontSizeFour: {
        fontSize: 30 // Define font size here in Pixels
    },
})