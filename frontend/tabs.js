import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import MyMap from './screens/MapScreen';
import HomeScreen from './screens/HomeScreen';
import Home from './screens/home';
import PlannerScreen from './screens/PlannerScreen';
import PostScreen from './screens/PostScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const Tabs = () =>{
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderRadius: 15, 
                    height: 100,
                    ...style.shadow
                }
            }}
        >
           <Tab.Screen name="Home" component={HomeScreen} options={{
            headerShown: false,
            tabBarIcon: ({focused}) => (
                <View style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Image 
                    source={require('wanderwise-frontend/icons/home(1).png')} 
                    resizeMode='contain'
                    style={{
                        width:25,
                        height:25,
                        tintColor: focused ? '#CE2D4F' : '#748c94',
                    }}
                    />
                    <Text style={{color: focused ? '#CE2D4F' : '#748c94', fontSize: 12}}>HOME</Text>
                </View>
            )
           }}></Tab.Screen>
           <Tab.Screen name="Map" component={MyMap} options={{
            headerShown: false,
            tabBarIcon: ({focused}) => (
                <View style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Image 
                    source={require('wanderwise-frontend/icons/placeholder.png')} 
                    resizeMode='contain'
                    style={{
                        width:25,
                        height:25,
                        tintColor: focused ? '#CE2D4F' : '#748c94',
                    }}
                    />
                    <Text style={{color: focused ? '#CE2D4F' : '#748c94', fontSize: 12}}>MAP</Text>
                </View>
            )
           }}></Tab.Screen>
           <Tab.Screen name="Post" component={PostScreen} options={{
            headerShown: false,
            tabBarIcon: ({focused}) => (
                <View style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Image 
                    source={require('wanderwise-frontend/icons/add.png')} 
                    resizeMode='contain'
                    style={{
                        width:25,
                        height:25,
                        tintColor: focused ? '#CE2D4F' : '#748c94',
                    }}
                    />
                    <Text style={{color: focused ? '#CE2D4F' : '#748c94', fontSize: 12}}></Text>
                </View>
            )
           }}></Tab.Screen>
            <Tab.Screen name="Planner" component={PlannerScreen} options={{
            headerShown: false,
            tabBarIcon: ({focused}) => (
                <View style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Image 
                    source={require('wanderwise-frontend/icons/menu.png')} 
                    resizeMode='contain'
                    style={{
                        width:25,
                        height:25,
                        tintColor: focused ? '#CE2D4F' : '#748c94',
                    }}
                    />
                    <Text style={{color: focused ? '#CE2D4F' : '#748c94', fontSize: 12}}>WIDGETS</Text>
                </View>
            )
           }}></Tab.Screen>
           <Tab.Screen name="Profile" component={ProfileScreen} options={{
            headerShown: false,
            tabBarIcon: ({focused}) => (
                <View style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Image 
                    source={require('wanderwise-frontend/icons/user.png')} 
                    resizeMode='contain'
                    style={{
                        width:25,
                        height:25,
                        tintColor: focused ? '#CE2D4F' : '#748c94',
                    }}
                    />
                    <Text style={{color: focused ? '#CE2D4F' : '#748c94', fontSize: 12}}>PROFILE</Text>
                </View>
            )
           }}></Tab.Screen>
        </Tab.Navigator>
      );
}

const style = StyleSheet.create({
    shadow: {
        shadowColor: '#7F5DF0',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25, 
        shadowRadius: 3.5, 
        elevation: 5
    }
})

export default Tabs;