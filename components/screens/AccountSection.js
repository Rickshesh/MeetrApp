import React, { useState } from 'react'
import { Surface, List, Portal, Modal, IconButton, Avatar, ActivityIndicator, Badge, Button, Text } from 'react-native-paper'
import { StyleSheet, ScrollView, Pressable, View, Image, Linking, Dimensions } from 'react-native'
import { useSelector, useDispatch } from 'react-redux';
import { toggleAccountSection } from '../actions/UserActions'


export default function AccountSection({ navigation }) {

    const showAccountSection = useSelector((store) => store.driver.showAccountSection);
    const dispatch = useDispatch();

    return (
        <Portal>
            <Modal contentContainerStyle={styles.containerStyle} visible={showAccountSection} onDismiss={() => dispatch(toggleAccountSection())}>
                <View style={{ flex: 0.6, justifyContent: "space-evenly", alignItems: "center" }}>
                    <Avatar.Icon size={100} icon="account" />
                    <Text variant="titleMedium">Rickshesh Manchanda</Text>
                    <Button mode="outlined"> Logout </Button>
                    <Button mode="outlined"> Change Password </Button>
                </View>
                <IconButton icon="window-close" onPress={() => dispatch(toggleAccountSection())} style={{ position: "absolute", right: 2, top: 2, backgroundColor: "white", borderWidth: 0.5 }} />
            </Modal>
        </Portal>
    )

}

const styles = StyleSheet.create({
    containerStyle: {
        flex: 0.6,
        margin: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: "center",
        alignItems: "center"
    },
})