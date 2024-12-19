// src/screens/RegistrationScreen.js
import React, { useState } from 'react';
import { Container } from '../components/Container';
import HeaderBar from '../components/HeaderBar';
import { View, TouchableOpacity } from 'react-native';
import { Label } from '../components/Label';
import { TextInputField } from '../components/TextInputField';
import { ActionButton, ActionButtonText } from '../components/ActionButton';
import BottomHelpBar from '../components/BottomHelpBar';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';

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

  return (
    <Container>
      <HeaderBar title="زمین زریں" />
      
      <View style={{ paddingHorizontal:16 }}>
        <ProfilePicPlaceholder>
          <TouchableOpacity>
            <Ionicons name="camera-outline" size={40} color="#333" />
          </TouchableOpacity>
        </ProfilePicPlaceholder>

        <Label>* کسان کا نام</Label>
        <TextInputField value={name} onChangeText={setName} placeholder="مثال: علی خان" />

        <Label>* موبائل نمبر</Label>
        <TextInputField value={phone} onChangeText={setPhone} placeholder="03xx xxx xxxx" keyboardType="phone-pad" />

        <Label>شناختی کارڈ نمبر</Label>
        <TextInputField value={nic} onChangeText={setNic} placeholder="xxxxx-xxxxxxx-x" />

        <Label>* ضلع</Label>
        <TextInputField value={district} onChangeText={setDistrict} placeholder="مثال: لاہور" />

        <ActionButton onPress={() => navigation.navigate('Dashboard')}>
          <ActionButtonText>رجسٹر کریں</ActionButtonText>
        </ActionButton>

        <Label style={{marginTop:16}}>اکاؤنٹ ہے؟ لاگ ان کریں</Label>
      </View>

      <BottomHelpBar />
    </Container>
  );
}
