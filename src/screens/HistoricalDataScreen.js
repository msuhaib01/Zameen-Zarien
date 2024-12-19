// src/screens/HistoricalDataScreen.js
import React from 'react';
import { Container } from '../components/Container';
import HeaderBar from '../components/HeaderBar';
import BottomHelpBar from '../components/BottomHelpBar';
import { View, Text, TouchableOpacity } from 'react-native';
import { Label } from '../components/Label';

export default function HistoricalDataScreen({ navigation }) {
  return (
    <Container>
      <HeaderBar
        title="زمین زریں"
        onSettingsPress={() => navigation.navigate('Settings')}
        onNotificationPress={() => navigation.navigate('Notifications')}
      />
      
      <View style={{padding:16}}>
        <Label>تاریخی ڈیٹا</Label>

        {/* Filters */}
        <TouchableOpacity style={{backgroundColor:'#fff', padding:12, borderRadius:4, marginBottom:8}}>
          <Text>کماڈٹی منتخب کریں ▼</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{backgroundColor:'#fff', padding:12, borderRadius:4, marginBottom:16}}>
          <Text>تاریخ کا انتخاب کریں ▼</Text>
        </TouchableOpacity>

        {/* Chart Placeholder */}
        <View style={{ backgroundColor:'#fff', height:200, borderRadius:8, justifyContent:'center', alignItems:'center', marginBottom:16 }}>
          <Text>Historical Chart Placeholder</Text>
        </View>

        <TouchableOpacity style={{ backgroundColor: '#0C6F38', padding:12, borderRadius:6, marginBottom:8 }}>
          <Text style={{color:'#fff', textAlign:'center'}}>ڈاؤنلوڈ تاریخ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: '#0C6F38', padding:12, borderRadius:6, marginBottom:8 }}>
          <Text style={{color:'#fff', textAlign:'center'}}>موازنہ کریں</Text>
        </TouchableOpacity>
      </View>

      <BottomHelpBar />
    </Container>
  );
}
