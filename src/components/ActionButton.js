// src/components/ActionButton.js
import styled from 'styled-components/native';

export const ActionButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 6px;
  padding: 14px;
  align-items: center;
  margin-vertical: ${({ theme }) => theme.spacing.md}px;
`;

export const ActionButtonText = styled.Text`
  color: #fff;
  font-size: ${({ theme }) => theme.fontSize.medium}px;
  font-weight: bold;
`;
