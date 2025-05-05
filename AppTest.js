import React from 'react';
import { View, StyleSheet, Text, Button } from 'react-native';
import TestConnection from './TestConnection';

export default function AppTest() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Zameen Zarien - Connection Test</Text>
      <TestConnection />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});
