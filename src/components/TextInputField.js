// src/components/TextInputField.js
import styled from 'styled-components/native';

export const TextInputField = styled.TextInput`
  background-color: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  padding: 12px;
  font-size: ${({ theme }) => theme.fontSize.regular}px;
  text-align: right;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  color: ${({ theme }) => theme.colors.textDark};
`;
