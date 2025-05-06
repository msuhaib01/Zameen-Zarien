import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from './config';

export default function ApiTest() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message, isSuccess = true) => {
    setResults(prev => [
      { id: Date.now(), message, isSuccess },
      ...prev
    ]);
  };

  const runTests = async () => {
    setLoading(true);
    setResults([]);
    addResult(`Starting API tests with base URL: ${API_BASE_URL}`);

    try {
      // Test 1: Basic connection
      addResult(`Test 1: Testing basic connection to ${API_BASE_URL}/api/test-connection/`);
      const connectionResponse = await axios.get(`${API_BASE_URL}/api/test-connection/`);
      addResult(`✅ Test 1 passed: ${JSON.stringify(connectionResponse.data)}`);

      // Test 2: Get locations
      addResult(`Test 2: Testing locations API at ${API_BASE_URL}/api/crop-prices/locations/`);
      const locationsResponse = await axios.get(`${API_BASE_URL}/api/crop-prices/locations/`);
      const locationsCount = locationsResponse.data.locations ? locationsResponse.data.locations.length : 0;
      addResult(`✅ Test 2 passed: Retrieved ${locationsCount} locations`);

      // Test 3: Get commodities
      addResult(`Test 3: Testing commodities API at ${API_BASE_URL}/api/crop-prices/commodities/`);
      const commoditiesResponse = await axios.get(`${API_BASE_URL}/api/crop-prices/commodities/`);
      const commoditiesCount = commoditiesResponse.data.commodities ? commoditiesResponse.data.commodities.length : 0;
      addResult(`✅ Test 3 passed: Retrieved ${commoditiesCount} commodities`);

      addResult(`All tests completed successfully!`);
    } catch (error) {
      addResult(`❌ Test failed: ${error.message}`, false);
      
      if (error.response) {
        addResult(`Server responded with status: ${error.response.status}`, false);
        addResult(`Response data: ${JSON.stringify(error.response.data)}`, false);
      } else if (error.request) {
        addResult(`No response received from server. Server might be down or network issue.`, false);
      } else {
        addResult(`Error setting up request: ${error.message}`, false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Connection Tests</Text>
      <Text style={styles.subtitle}>Base URL: {API_BASE_URL}</Text>
      
      <Button 
        title={loading ? "Running Tests..." : "Run API Tests"} 
        onPress={runTests} 
        disabled={loading}
      />
      
      {loading && <ActivityIndicator size="large" style={styles.loader} />}
      
      <ScrollView style={styles.resultsContainer}>
        {results.map(result => (
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
  loader: {
    marginVertical: 20,
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
