// src/screens/SettingsScreen.js
import React, { useState } from 'react';
import { Container } from '../components/Container';
import HeaderBar from '../components/HeaderBar';
import BottomHelpBar from '../components/BottomHelpBar';
import { View, Text, TextInput, TouchableOpacity, Switch, Alert } from 'react-native';
import { Label } from '../components/Label';

export default function SettingsScreen({ navigation }) {
  const [isUrdu, setIsUrdu] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(true);

  const handleLanguageToggle = () => {
    setIsUrdu(!isUrdu);
    Alert.alert(
      "Language Changed",
      `Language has been changed to ${!isUrdu ? 'Urdu' : 'English'}.`
    );
  };

  const getText = (urduText, englishText) => (isUrdu ? urduText : englishText);

  return (
    <Container>
      <HeaderBar
        title={getText("زمین زریں", "Zameen Zarien")}
        onNotificationPress={() => navigation.navigate('Notifications')}
      />

      <View style={{padding:16}}>
        <Label>{getText("ترتیبات", "Settings")}</Label>

        {/* Language Toggle */}
        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'flex-end', marginVertical:8}}>
          <Text style={{marginRight:8}}>{getText("زبان (اردو/English):", "Language (Urdu/English):")}</Text>
          <Switch value={isUrdu} onValueChange={handleLanguageToggle} />
          
        </View>

      {/* Account Info */}
        <Label>{getText("اکاؤنٹ معلومات", "Account Information")}</Label>
        <TextInput 
          style={{backgroundColor:'#fff', padding:8, borderRadius:4, marginBottom:8, textAlign:'right'}}
          placeholder={getText("ای میل", "Email")}
        />
        <TextInput 
          style={{backgroundColor:'#fff', padding:8, borderRadius:4, marginBottom:16, textAlign:'right'}}
          placeholder={getText("پاس ورڈ", "Password")}
          secureTextEntry
        />

        {/* Notification Preferences */}
        <Label>{getText("نوٹیفکیشن ترجیحات", "Notification Preferences")}</Label>
        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'flex-end', marginVertical:8}}>
          <Text style={{marginRight:8}}>{getText("نوٹیفکیشنز آن/آف:", "Notifications On/Off:")}</Text>
          <Switch value={notifEnabled} onValueChange={setNotifEnabled}/>
        </View>

        {/* Default Commodity */}
        <Label>{getText("ڈیفالٹ کماڈٹی", "Default Commodity")}</Label>
        <TouchableOpacity style={{backgroundColor:'#fff', padding:12, borderRadius:4, marginBottom:16}}>
          <Text>{getText("گندم ▼", "Wheat ▼")}</Text>
        </TouchableOpacity>

        {/* Reset and Terms */}
        <TouchableOpacity style={{backgroundColor:'#0C6F38', padding:12, borderRadius:6, marginBottom:8}}>
          <Text style={{color:'#fff', textAlign:'center'}}>{getText("ری سیٹ", "Reset")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{marginBottom:8}}>
          <Text style={{textAlign:'right', textDecorationLine:'underline'}}>{getText("شرائط و ضوابط", "Terms and Conditions")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{marginBottom:8}}>
          <Text style={{textAlign:'right', textDecorationLine:'underline'}}>{getText("پرائیویسی پالیسی", "Privacy Policy")}</Text>
        </TouchableOpacity>
      </View>

      <BottomHelpBar />
    </Container>
  );
}
