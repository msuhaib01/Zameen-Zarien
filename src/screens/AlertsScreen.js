// src/screens/AlertsScreen.js
import React, { useState } from 'react';
import { Container } from '../components/Container';
import HeaderBar from '../components/HeaderBar';
import BottomHelpBar from '../components/BottomHelpBar';
import { ScrollView, View, Text, TouchableOpacity, Switch } from 'react-native';
import { Label } from '../components/Label';
import styled from 'styled-components/native';

const AlertCard = styled.View`
  background-color: #fff;
  padding: 16px;
  border-radius: 8px;
  margin-vertical: 8px;
`;

export default function AlertsScreen({ navigation }) {
  // Sample state
  const [alerts, setAlerts] = useState([
    { id: 1, commodity: 'گندم', threshold: 205, enabled: true },
    { id: 2, commodity: 'چاول', threshold: 300, enabled: false }
  ]);

  const toggleAlert = (id) => {
    setAlerts(alerts.map(a => a.id === id ? {...a, enabled: !a.enabled} : a));
  };

  return (
    <Container>
      <HeaderBar
        title="زمین زریں"
        onSettingsPress={() => navigation.navigate('Settings')}
        onNotificationPress={() => navigation.navigate('Notifications')}
      />

      <ScrollView contentContainerStyle={{padding:16}}>
        <Label>الرٹس</Label>
        {alerts.map(alert => (
          <AlertCard key={alert.id}>
            <Label>{alert.commodity}</Label>
            <Text style={{textAlign:'right'}}>حد قیمت: {alert.threshold} PKR</Text>
            <View style={{flexDirection:'row', justifyContent:'space-between', marginTop:8}}>
              <TouchableOpacity style={{ backgroundColor:'#0C6F38', padding:8, borderRadius:4, marginRight:8 }}>
                <Text style={{color:'#fff', textAlign:'center'}}>ترمیم</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ backgroundColor:'#8B0000', padding:8, borderRadius:4, marginRight:8 }}>
                <Text style={{color:'#fff', textAlign:'center'}}>حذف</Text>
              </TouchableOpacity>
              <View style={{flexDirection:'row', alignItems:'center'}}>
                <Text style={{marginRight:8}}>فعال:</Text>
                <Switch
                  value={alert.enabled}
                  onValueChange={() => toggleAlert(alert.id)}
                />
              </View>
            </View>
          </AlertCard>
        ))}

        <TouchableOpacity style={{backgroundColor:'#0C6F38', padding:12, borderRadius:6, marginTop:16}}>
          <Text style={{color:'#fff', textAlign:'center'}}>نیا الرٹ</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomHelpBar />
    </Container>
  );
}
