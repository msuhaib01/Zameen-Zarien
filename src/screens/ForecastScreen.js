// src/screens/ForecastScreen.js
import React from 'react';
import { Container } from '../components/Container';
import HeaderBar from '../components/HeaderBar';
import BottomHelpBar from '../components/BottomHelpBar';
import { View, Text, TouchableOpacity } from 'react-native';
import { Label } from '../components/Label';

export default function ForecastScreen() {
  return (
    <Container>
      <HeaderBar title="زمین زریں" />
      
      <View style={{padding:16}}>
        <Label>گندم قیمت پیشنگوئی</Label>
        <TouchableOpacity style={{backgroundColor:'#fff', padding:8, borderRadius:4, marginBottom:16}}>
          <Text>آئندہ ہفتہ ▼</Text>
        </TouchableOpacity>

        <View style={{ backgroundColor:'#fff', height:200, borderRadius:8, justifyContent:'center', alignItems:'center', marginBottom:16 }}>
          <Text>Forecast Chart Placeholder</Text>
        </View>

        <TouchableOpacity style={{ backgroundColor: '#0C6F38', padding:12, borderRadius:6, marginBottom:8 }}>
          <Text style={{color:'#fff', textAlign:'center'}}>ڈاؤنلوڈ رپورٹ</Text>
        </TouchableOpacity>
      </View>
      
      <BottomHelpBar />
    </Container>
  );
}
