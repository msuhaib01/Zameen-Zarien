// src/screens/NotificationsScreen.js
import React, { useState } from 'react';
import { Container } from '../components/Container';
import HeaderBar from '../components/HeaderBar';
import BottomHelpBar from '../components/BottomHelpBar';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Switch } from 'react-native';
import { Label } from '../components/Label';
import styled from 'styled-components/native';

const NotificationCard = styled.View`
  background-color: #fff;
  padding: 16px;
  border-radius: 8px;
  margin-vertical: 8px;
`;

export default function NotificationsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [dnd, setDnd] = useState(false);
  // Sample notifications
  const [notifications] = useState([
    { id:1, title:'گندم کی قیمت میں اضافہ', date:'2024-01-01' },
    { id:2, title:'چاول کی قیمت گر گئی', date:'2024-01-02' }
  ]);

  return (
    <Container>
      <HeaderBar
        title="زمین زریں"
        onSettingsPress={() => navigation.navigate('Settings')}
      />

      <View style={{padding:16}}>
        <Label>نوٹیفکیشنز</Label>
        
        {/* Search bar */}
        <TextInput
          style={{backgroundColor:'#fff', padding:8, borderRadius:4, marginBottom:16, textAlign:'right'}}
          placeholder="تلاش کریں..."
          value={search}
          onChangeText={setSearch}
        />

        {/* DND Toggle */}
        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'flex-end', marginBottom:16}}>
          <Text style={{marginRight:8}}>ڈو ناٹ ڈسٹرب:</Text>
          <Switch value={dnd} onValueChange={setDnd}/>
        </View>

        <ScrollView>
          {notifications.map(n => (
            <NotificationCard key={n.id}>
              <Label>{n.title}</Label>
              <Text style={{textAlign:'right', marginVertical:8}}>تاریخ: {n.date}</Text>
              <View style={{flexDirection:'row', justifyContent:'flex-end'}}>
                <TouchableOpacity style={{ backgroundColor:'#0C6F38', padding:8, borderRadius:4, marginHorizontal:4 }}>
                  <Text style={{color:'#fff'}}>پڑھا گیا</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ backgroundColor:'#8B0000', padding:8, borderRadius:4, marginHorizontal:4 }}>
                  <Text style={{color:'#fff'}}>حذف</Text>
                </TouchableOpacity>
              </View>
            </NotificationCard>
          ))}
        </ScrollView>
      </View>

      <BottomHelpBar />
    </Container>
  );
}
