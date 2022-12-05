import * as React from 'react'
import { Pressable } from 'react-native'
import { Appbar, Avatar, useTheme, Drawer } from 'react-native-paper'
import { toggleAccountSection } from '../actions/UserActions'
import { useSelector, useDispatch } from 'react-redux';


export default function TopBar({ navigation }) {

    const dispatch = useDispatch();

    return (
        <Appbar.Header mode="small" statusBarHeight={30} elevated={true} style={{ backgroundColor: "#FBDA60" }}>
            <Appbar.Action size={30} icon="menu" onPress={() => { navigation.openDrawer() }} color="#4C243B" />
            <Appbar.Content title="" />
            <Appbar.Action size={30} icon="home" onPress={() => navigation.jumpTo("List")} color="#4C243B" />
            <Pressable onPress={() => dispatch(toggleAccountSection())}><Avatar.Icon size={30} icon="account" style={{ backgroundColor: "#4C243B" }} /></Pressable>
        </Appbar.Header>

    )
};
