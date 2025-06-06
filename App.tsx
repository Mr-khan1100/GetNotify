//App.tsx
import { StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Home from './src/Home';
import { initNotificationService, setupBackgroundHandler } from './src/notifications';

const App = () => {

    useEffect(() => {
      let unsubscribe: any;
      
      // Initialize background handler FIRST
      setupBackgroundHandler();
      
      const initialize = async () => {
        unsubscribe = await initNotificationService();
      };

      initialize();

      return () => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
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
