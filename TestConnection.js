import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from './config';

export default function TestConnection() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message, isSuccess = true) => {
    setTestResults(prev => [
      { id: Date.now(), message, isSuccess },
      ...prev
    ]);
  };

  const testConnection = async () => {
    setLoading(true);
    addResult('Starting connection test...');

    try {
      // Test the connection endpoint
      addResult(`Trying to connect to: ${API_BASE_URL}/api/test-connection/`);
      const response = await axios.get(`${API_BASE_URL}/api/test-connection/`);
      addResult(`Connection successful! Server responded with: ${JSON.stringify(response.data)}`);
      
      // Additional information
      addResult(`Your client IP according to server: ${response.data.client_ip}`);
    } catch (error) {
      addResult(`Connection failed: ${error.message}`, false);
      
      // More detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        addResult(`Server responded with status: ${error.response.status}`, false);
        addResult(`Response data: ${JSON.stringify(error.response.data)}`, false);
      } else if (error.request) {
        // The request was made but no response was received
        addResult('No response received from server. Server might be down or network issue.', false);
      } else {
        // Something happened in setting up the request that triggered an Error
        addResult(`Error setting up request: ${error.message}`, false);
      }
      
      // Network error details
      if (error.code) {
        addResult(`Error code: ${error.code}`, false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connection Test Tool</Text>
      <Text style={styles.subtitle}>API URL: {API_BASE_URL}</Text>
      
      <Button 
        title={loading ? "Testing..." : "Test Connection"} 
        onPress={testConnection} 
        disabled={loading}
      />
      
      <ScrollView style={styles.resultsContainer}>
        {testResults.map(result => (
          <View 
            key={result.id} 
            style={[
              styles.resultItem, 
              { backgroundColor: result.isSuccess ? '#e6ffe6' : '#ffe6e6' }
            ]}
          >
            <Text style={styles.resultText}>{result.message}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  resultsContainer: {
    marginTop: 20,
    flex: 1,
  },
  resultItem: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
  },
});
