// src/screens/RegistrationScreen.js
import React, { useState, useEffect } from 'react';
import { Container } from '../components/Container';
import HeaderBar from '../components/HeaderBar';
import { View, TouchableOpacity } from 'react-native';
import { Label } from '../components/Label';
import { TextInputField } from '../components/TextInputField';
import { ActionButton, ActionButtonText } from '../components/ActionButton';
import BottomHelpBar from '../components/BottomHelpBar';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfilePicPlaceholder = styled.View`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  background-color: #ddd;
  align-items: center;
  justify-content: center;
  margin-vertical: 24px;
  align-self: center;
`;

export default function RegistrationScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nic, setNic] = useState('');
  const [district, setDistrict] = useState('');
  const [isUrdu, setIsUrdu] = useState(true);

  useEffect(() => {
    const fetchLanguagePreference = async () => {
      const languagePreference = await AsyncStorage.getItem('languagePreference');
      setIsUrdu(languagePreference === 'urdu');
    };
    fetchLanguagePreference();
  }, []);

  const getText = (urduText, englishText) => (isUrdu ? urduText : englishText);

  return (
    <Container>
      <HeaderBar title={getText("زمین زریں", "Zameen Zarien")} />
      
      <View style={{ paddingHorizontal:16 }}>
        <ProfilePicPlaceholder>
          <TouchableOpacity>
            <Ionicons name="camera-outline" size={40} color="#333" />
          </TouchableOpacity>
        </ProfilePicPlaceholder>

        <Label>{getText("* کسان کا نام", "* Farmer's Name")}</Label>
        <TextInputField value={name} onChangeText={setName} placeholder={getText("مثال: علی خان", "e.g., Ali Khan")} />

        <Label>{getText("* موبائل نمبر", "* Mobile Number")}</Label>
        <TextInputField value={phone} onChangeText={setPhone} placeholder={getText("03xx xxx xxxx", "03xx xxx xxxx")} keyboardType="phone-pad" />

        <Label>{getText("شناختی کارڈ نمبر", "NIC Number")}</Label>
        <TextInputField value={nic} onChangeText={setNic} placeholder={getText("xxxxx-xxxxxxx-x", "xxxxx-xxxxxxx-x")} />

        <Label>{getText("* ضلع", "* District")}</Label>
        <TextInputField value={district} onChangeText={setDistrict} placeholder={getText("مثال: لاہور", "e.g., Lahore")} />

        <ActionButton onPress={() => navigation.navigate('Dashboard')}>
          <ActionButtonText>{getText("رجسٹر کریں", "Register")}</ActionButtonText>
        </ActionButton>

        <Label style={{marginTop:16}}>{getText("اکاؤنٹ ہے؟ لاگ ان کریں", "Already have an account? Log in")}</Label>
      </View>

      <BottomHelpBar />
    </Container>
  );
}
