import { StyleSheet } from 'react-native';
import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Home from './src/Home';

const App = () => {

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
