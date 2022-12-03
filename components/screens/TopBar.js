import * as React from 'react'
import { Pressable } from 'react-native'
import { Appbar, Avatar, useTheme } from 'react-native-paper'

export default function TopBar({ navigation }) {
    const theme = useTheme()

    return (
        <Appbar.Header mode="small" statusBarHeight={30} elevated={true} style={{ backgroundColor: "#FBDA60" }}>
            <Appbar.Action size={30} icon="menu" onPress={() => { }} color="#4C243B" />
            <Appbar.Content title="" />
            <Appbar.Action size={30} icon="home" onPress={() => navigation.navigate("List")} color="#4C243B" />
            <Pressable onPress={() => navigation.navigate("Register")}><Avatar.Text size={30} label="RM" style={{ backgroundColor: "#4C243B" }} /></Pressable>
        </Appbar.Header>
    )
};
