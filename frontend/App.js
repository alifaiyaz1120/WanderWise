import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './screens/home';
import Register from './screens/register';
import Login from './screens/login';
import MainPage from './mainpage';
import MyMap from './screens/MapScreen';
import RenderOtherUserProfile from './Components/RenderOtherUserProfile';
import LocationDetailsPage from './screens/LocationDetailsPage';
import ProfileScreen from './screens/ProfileScreen';
import BudgetTracker from './screens/BudgetTracker';
import FlightStatus from './screens/FlightStatus';
import FlightDetails from './screens/FlightDetails';
import MyCalendar from './Components/Calendar';
import { LogBox } from 'react-native';

const Stack = createStackNavigator();

export default function App() {
  LogBox.ignoreAllLogs(true);
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="Register"
          component={Register}
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="MainPage"
          component={MainPage} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name = "MapScreen"
          component={MyMap}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="RenderOtherUserProfile"
          component={RenderOtherUserProfile}
          options={{headerShown: false}}
        ></Stack.Screen>
        <Stack.Screen 
        name="LocationDetails" 
        component={LocationDetailsPage} 
        options={{ headerShown: false }}
        />
        <Stack.Screen
          name = "ProfileScreen"
          component={ProfileScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="BudgetTracker"
          component={BudgetTracker}
          options={{headerShown: false}}
        ></Stack.Screen>
        <Stack.Screen
          name = "FlightDetails"
          component={FlightDetails}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name = "FlightStatus"
          component={FlightStatus}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="MyCalendar"
          component={MyCalendar}
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
