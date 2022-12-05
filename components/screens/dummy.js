<Tab.Screen
    name={'search'}
    component={SearchNavigator}
    options={{
        tabBarIcon: ({ focused, color }) => (
            <View>
                <Icon
                    name='search1'
                    color={
                        focused
                            ? 'black'
                            : 'white'
                    }
                    size={25}
                />
            </View>
        ),
    }}
    listeners={{
        tabPress: (e) => {
            if (true) {
                // Prevent default action
                e.preventDefault()
                // Prompt the user before leaving the screen
                Alert.alert(
                    'Discard changes?',
                    'You have unsaved changes. Are you sure to discard them and leave the screen?',
                    [
                        {
                            text: "Don't leave",
                            style: 'cancel',
                            onPress: () => { },
                        },
                        {
                            text: 'Discard',
                            style: 'destructive',
                            // If the user confirmed, then we dispatch the action we blocked earlier
                            // This will continue the action that had triggered the removal of the screen
                            onPress: () =>
                                navigationRef.current?.navigate(
                                    'search',
                                    {}
                                ),
                        },
                    ]
                )
            }
        },
    }}
/>