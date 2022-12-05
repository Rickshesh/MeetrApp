import { Appbar, Avatar, useTheme, Drawer } from 'react-native-paper'
import * as React from 'react'



export default function DrawerSection(props) {

    console.log(JSON.stringify(props))

    return (
        <Drawer.Section title="Some title">
            <Drawer.Item
                label="First Item"
            />
            <Drawer.Item
                label="Second Item"
            />
        </Drawer.Section>
    )
}