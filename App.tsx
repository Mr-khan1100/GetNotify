import { StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Home from './src/Home';
import { initNotificationService } from './src/notifications';

const App = () => {

  useEffect(() => {
    const initializeApp = async () => {
      await initNotificationService(); // Initialize before anything else
    };
    initializeApp();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.bgColor}>
        <Home/>
      </SafeAreaView>
    </SafeAreaProvider>

  )
}

const styles = StyleSheet.create({
  bgColor: {
    backgroundColor: '#FFFFFF',
    flex:1,
  },
});

export default App;
