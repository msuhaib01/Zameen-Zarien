// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { Container } from '../components/Container';
import HeaderBar from '../components/HeaderBar';
import { View, Image } from 'react-native';
import { Label } from '../components/Label';
import { TextInputField } from '../components/TextInputField';
import { ActionButton, ActionButtonText } from '../components/ActionButton';
import BottomHelpBar from '../components/BottomHelpBar';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');

  return (
    <Container>
      <HeaderBar title="زمین زریں" />
      
      {/* Logo */}
      <View style={{ alignItems: 'center', marginVertical: 24 }}>
        <Image source={require('../../assets/zameen_zarien_logo.png')} style={{width:100, height:100}} resizeMode="contain" />
      </View>
      
      <View style={{paddingHorizontal:16}}>
        <Label>* موبائل نمبر</Label>
        <TextInputField
          placeholder="03xx xxx xxxx"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <ActionButton onPress={() => navigation.navigate('Dashboard')}>
          <ActionButtonText>لاگ ان</ActionButtonText>
        </ActionButton>

        <Label style={{marginTop:16}}>پاسورڈ بھول گئے؟</Label>
        <Label>اکاؤنٹ نہیں ہے؟ رجسٹر کریں</Label>
      </View>

      <BottomHelpBar />
    </Container>
  );
}
