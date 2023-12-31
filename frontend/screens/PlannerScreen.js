import React, { useLayoutEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import BudgetWidget from '../Components/BudgetWidget';
import EventsToday from '../Components/EventsToday';
import FlightStatus from './FlightStatus';
import UserPost from '../Components/UserPost';
import OtherUserProfile from '../Components/otherUserProfile';
import { Platform } from 'react-native';

const PlannerScreen = ({ navigation }) => {
  const [refreshKeyEvents, setRefreshKeyEvents] = React.useState(0);
  const [refreshKeyBudget, setRefreshKeyBudget] = React.useState(1);
  useFocusEffect(
    React.useCallback(() => {

      setRefreshKeyEvents((prev) => prev + 1);
      setRefreshKeyBudget((prev) => prev + 1);
    }, [])
  );


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.contentContainer}>
          <EventsToday key={refreshKeyEvents} />
          <BudgetWidget key={refreshKeyBudget} />
          <FlightStatus />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: Platform.OS === 'ios' ? 0 : 20,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default PlannerScreen;
