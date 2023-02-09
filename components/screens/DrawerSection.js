import { Appbar, Avatar, useTheme, Drawer } from 'react-native-paper'
import * as React from 'react'
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleAccountSection } from '../actions/UserActions'





export default function DrawerSection({ state, navigation, descriptors }) {

    const dispatch = useDispatch();
    const showAccountSection = useSelector((store) => store.driver.showAccountSection);
    const [index, setIndex] = React.useState(0);

    useEffect(() => {
        setIndex(state.index)
    })

    return (
        <>
            <Drawer.Section title="">
                <Drawer.Item
                    label="Register Driver"
                    icon="account-plus"
                    active={index == 1}
                    onPress={() => navigation.jumpTo("Register")}
                />
                <Drawer.Item
                    label="Driver List"
                    icon="format-list-bulleted"
                    active={index == 0}
                    onPress={() => navigation.jumpTo("List")}
                />
            </Drawer.Section>
            <Drawer.Section>
                <Drawer.Item
                    label="Account"
                    icon="account"
                    onPress={() => dispatch(toggleAccountSection())}
                    active={showAccountSection}
                />
            </Drawer.Section>
        </>
    )
}