// src/components/Label.js
import styled from 'styled-components/native';

export const Label = styled.Text`
  font-size: ${({ theme }) => theme.fontSize.medium}px;
  color: ${({ theme }) => theme.colors.textDark};
  margin-vertical: ${({ theme }) => theme.spacing.sm}px;
  text-align: right;
`;
