import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../Constants";
import { useDispatch } from "react-redux";
import { clearCaptureImage } from "../Slice/ImageSlice";

const BackButton = ({ color, clearImage }: any) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => {
      if (clearImage) {
        dispatch(clearCaptureImage());
        navigation?.goBack()
      } else {
        navigation?.goBack()
      }
    }}>
      <Ionicons
        name={"arrow-back-circle-outline"}
        size={40}
        color={color ? color : COLORS.solidBlack}
      />
    </TouchableOpacity>
  );
};

export default BackButton;
