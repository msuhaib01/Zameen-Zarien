// src/screens/DashboardScreen.js
import React, { useState } from 'react';
import { Container } from '../components/Container';
import HeaderBar from '../components/HeaderBar';
import BottomHelpBar from '../components/BottomHelpBar';
import { ScrollView, View, Text, Image, TouchableOpacity } from 'react-native';
import { Label } from '../components/Label';
import styled from 'styled-components/native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MetricText = styled.Text`
  color: ${({ theme }) => theme.colors.textDark};
  font-size: ${({ theme }) => theme.fontSize.medium}px;
  margin-vertical: ${({ theme }) => theme.spacing.sm}px;
  text-align: right;
`;

export default function DashboardScreen({ navigation }) {
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
      <HeaderBar 
        title={getText("زمین زریں", "Zameen Zarien")}
        onSettingsPress={() => navigation.navigate('Settings')}
        onNotificationPress={() => navigation.navigate('Notifications')}
      />
      
      <ScrollView contentContainerStyle={{padding:16}}>
        {/* Commodity and Price Info */}
        <View style={{ backgroundColor:'#fff', padding:16, borderRadius:8, marginBottom:16 }}>
          <Label>گندم</Label>
          <MetricText>قیمت حالیہ: 200 PKR</MetricText>
          <MetricText>زیادہ سے زیادہ: 210 PKR</MetricText>
          <MetricText>کم سے کم: 195 PKR</MetricText>
          <MetricText>اوسط: 202 PKR</MetricText>
        </View>

        {/* Filters & Graph (Placeholder) */}
        <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:16}}>
          <TouchableOpacity style={{ backgroundColor:'#fff', padding:8, borderRadius:4 }}>
            <Text>Commodity ▼</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ backgroundColor:'#fff', padding:8, borderRadius:4 }}>
            <Text>Time Period ▼</Text>
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor:'#fff', height:200, borderRadius:8, justifyContent:'center', alignItems:'center', marginBottom:16 }}>
          <Text>Chart Placeholder</Text>
        </View>

        <TouchableOpacity style={{ backgroundColor: '#0C6F38', padding:12, borderRadius:6, marginBottom:8 }}>
          <Text style={{color:'#fff', textAlign:'center'}}>ڈاؤنلوڈ ڈیٹا</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: '#0C6F38', padding:12, borderRadius:6, marginBottom:8 }} onPress={() => navigation.navigate('Forecast')}>
          <Text style={{color:'#fff', textAlign:'center'}}>تفصیلی مشاہدہ</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomHelpBar />
    </Container>
  );
}
