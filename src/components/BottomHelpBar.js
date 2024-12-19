// src/components/BottomHelpBar.js
import React from 'react';
import styled from 'styled-components/native';

const HelpBarContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.sm}px;
  align-items: center;
  justify-content: center;
`;

const HelpText = styled.Text`
  font-size: ${({ theme }) => theme.fontSize.regular}px;
  color: #fff;
`;

export default function BottomHelpBar() {
  return (
    <HelpBarContainer>
      <HelpText>رہنمائی کے لیے کال کریں</HelpText>
    </HelpBarContainer>
  );
}
