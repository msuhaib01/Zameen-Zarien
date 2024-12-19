// src/screens/SettingsScreen.js
import React, { useState } from 'react';
import { Container } from '../components/Container';
import HeaderBar from '../components/HeaderBar';
import BottomHelpBar from '../components/BottomHelpBar';
import { View, Text, TextInput, TouchableOpacity, Switch } from 'react-native';
import { Label } from '../components/Label';

export default function SettingsScreen({ navigation }) {
  const [isUrdu, setIsUrdu] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(true);

  return (
    <Container>
      <HeaderBar
        title="زمین زریں"
        onNotificationPress={() => navigation.navigate('Notifications')}
      />

      <View style={{padding:16}}>
        <Label>ترتیبات</Label>

        {/* Language Toggle */}
        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'flex-end', marginVertical:8}}>
          <Text style={{marginRight:8}}>زبان (اردو/English):</Text>
          <Switch value={isUrdu} onValueChange={setIsUrdu} />
        </View>

        {/* Account Info */}
        <Label>اکاؤنٹ معلومات</Label>
        <TextInput 
          style={{backgroundColor:'#fff', padding:8, borderRadius:4, marginBottom:8, textAlign:'right'}}
          placeholder="ای میل"
        />
        <TextInput 
          style={{backgroundColor:'#fff', padding:8, borderRadius:4, marginBottom:16, textAlign:'right'}}
          placeholder="پاس ورڈ"
          secureTextEntry
        />

        {/* Notification Preferences */}
        <Label>نوٹیفکیشن ترجیحات</Label>
        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'flex-end', marginVertical:8}}>
          <Text style={{marginRight:8}}>نوٹیفکیشنز آن/آف:</Text>
          <Switch value={notifEnabled} onValueChange={setNotifEnabled}/>
        </View>

        {/* Default Commodity */}
        <Label>ڈیفالٹ کماڈٹی</Label>
        <TouchableOpacity style={{backgroundColor:'#fff', padding:12, borderRadius:4, marginBottom:16}}>
          <Text>گندم ▼</Text>
        </TouchableOpacity>

        {/* Reset and Terms */}
        <TouchableOpacity style={{backgroundColor:'#0C6F38', padding:12, borderRadius:6, marginBottom:8}}>
          <Text style={{color:'#fff', textAlign:'center'}}>ری سیٹ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{marginBottom:8}}>
          <Text style={{textAlign:'right', textDecorationLine:'underline'}}>شرائط و ضوابط</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{marginBottom:8}}>
          <Text style={{textAlign:'right', textDecorationLine:'underline'}}>پرائیویسی پالیسی</Text>
        </TouchableOpacity>
      </View>

      <BottomHelpBar />
    </Container>
  );
}
