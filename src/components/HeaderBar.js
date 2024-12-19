// src/components/HeaderBar.js
import React from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';

const HeaderContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.md}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.Text`
  color: #fff;
  font-size: ${({ theme }) => theme.fontSize.large}px;
  font-weight: bold;
  flex: 1;
  text-align: center;
`;

const IconButton = styled.TouchableOpacity`
  padding: ${({ theme }) => theme.spacing.sm}px;
`;

export default function HeaderBar({ 
  title = "زمین زریں",
  onSettingsPress,
  onNotificationPress
}) {
  return (
    <HeaderContainer>
      {onNotificationPress ? (
        <IconButton onPress={onNotificationPress}>
          <Ionicons name="notifications-outline" size={28} color="#fff" />
        </IconButton>
      ) : <IconButton style={{opacity:0}}><Ionicons name="notifications-outline" size={28} color="#fff" /></IconButton>}
      
      <Title>{title}</Title>
      
      {onSettingsPress ? (
        <IconButton onPress={onSettingsPress}>
          <Ionicons name="settings-outline" size={28} color="#fff" />
        </IconButton>
      ) : <IconButton style={{opacity:0}}><Ionicons name="settings-outline" size={28} color="#fff" /></IconButton>}
    </HeaderContainer>
  );
}
