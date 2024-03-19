import React from "react";
import { Dimensions, StyleSheet, TextInput, View } from "react-native";
import { COLORS } from "../Constants";
import { FONT } from "../Constants/theme";

const { width } = Dimensions.get("screen");

interface IPropsTypes {
  placeHolderText?: string;
  refs?: any;
  isSecure?: boolean;
  onChange: any;
  isAutoFocus?: boolean;
  isNextFocus?: any;
  keyType?: any;
  textContainer?: any;
  values: string;
  maxLength?: number;
  onBlurInput?: any;
  numofLine?: number;
  isMultiLine?: boolean;
  isError?: any;
}

const InputText = ({
  placeHolderText,
  refs,
  isSecure,
  onChange,
  isAutoFocus,
  isNextFocus,
  keyType,
  textContainer,
  maxLength,
  values,
  onBlurInput,
  numofLine,
  isMultiLine,
  isError,
}: IPropsTypes) => {
  return (
    <View style={textContainer}>
      <TextInput
        ref={refs}
        style={[
          styles.textInputStyles,
          {
            borderColor: isError ? COLORS.danger : COLORS.secondary,
          },
        ]}
        placeholder={placeHolderText}
        autoFocus={isAutoFocus}
        value={values}
        onChangeText={onChange}
        onSubmitEditing={() => {
          setTimeout(() => {
            isNextFocus?.current?.focus();
          }, 300);
        }}
        onBlur={onBlurInput}
        secureTextEntry={isSecure}
        maxLength={maxLength}
        placeholderTextColor={"#979292"}
        keyboardType={keyType}
        numberOfLines={numofLine}
        multiline={isMultiLine}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  textInputStyles: {
    borderWidth: 1,
    borderColor: COLORS.secondary,
    width: width / 1.2,
    height: 46,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: COLORS.solidBlack,
    padding: 0,
    fontFamily: FONT.notoSansMedium,
  },
});

export default InputText;
