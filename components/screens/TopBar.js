import * as React from 'react'
import { Appbar, Avatar, useTheme } from 'react-native-paper'

export default function TopBar() {
    const theme = useTheme()

    return (
        <Appbar.Header mode="small" statusBarHeight={30} elevated={true} style={{ backgroundColor: "#FBDA60" }}>
            <Appbar.Action size={30} icon="menu" onPress={() => { }} color="#4C243B" />
            <Appbar.Content title="" />
            <Appbar.Action size={30} icon="home" onPress={() => { }} color="#4C243B" />
            <Avatar.Text size={30} label="RM" onPress={() => { }} style={{ backgroundColor: "#4C243B" }} />
        </Appbar.Header>
    )
};
