import { View, TextInput, Text, StyleSheet } from "react-native"
import { COLORS, FONT, SPACING } from "../theme"

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  error,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  labelStyle,
  ...props
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, multiline && styles.multilineInput, inputStyle]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        placeholderTextColor={COLORS.gray}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.large,
  },
  label: {
    fontSize: FONT.sizes.medium,
    marginBottom: SPACING.small,
    color: COLORS.text.primary,
    fontWeight: "500",
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.medium,
    fontSize: FONT.sizes.medium,
    color: COLORS.text.primary,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT.sizes.small,
    marginTop: SPACING.xs,
  },
})

export default Input

