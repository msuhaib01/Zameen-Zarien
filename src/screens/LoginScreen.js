// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { Container } from '../components/Container';
import HeaderBar from '../components/HeaderBar';
import { View, Image } from 'react-native';
import { Label } from '../components/Label';
import { TextInputField } from '../components/TextInputField';
import { ActionButton, ActionButtonText } from '../components/ActionButton';
import BottomHelpBar from '../components/BottomHelpBar';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [isUrdu, setIsUrdu] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const fetchLanguagePreference = async () => {
        const languagePreference = await AsyncStorage.getItem('languagePreference');
        setIsUrdu(languagePreference === 'urdu');
      };
      fetchLanguagePreference();
    }, [])
  );

  const getText = (urduText, englishText) => (isUrdu ? urduText : englishText);

  return (
    <Container>
      <HeaderBar title={getText("زمین زریں", "Zameen Zarien")} />
      
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
