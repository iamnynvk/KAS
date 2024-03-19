import React, { useEffect, useRef } from "react";
import {
  Text,
  TouchableOpacity,
  Image,
  Animated,
  NativeModules,
  Platform,
} from "react-native";
import { COLORS, FONT, images } from "../Constants";
import { useDispatch, useSelector } from "react-redux";
import { hideFeedback } from "../Slice/feedbackSlice";

const GlobalMessagePopUp = () => {
  const dispatch = useDispatch();
  const { StatusBarManager } = NativeModules;
  const { language } = useSelector((state: any) => state.Preference);
  const feedBack = useSelector((state: any) => state.feedback);
  const slideAnimation = useRef(new Animated.Value(-100)).current;

  const handleRemove = () => dispatch(hideFeedback());

  useEffect(() => {
    if (feedBack?.message) {
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnimation, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [feedBack?.message]);

  useEffect(() => {
    const timeOut =
      feedBack?.show &&
      setTimeout(() => {
        dispatch(hideFeedback());
      }, 3500);

    return () => clearTimeout(timeOut);
  }, [feedBack?.message]);

  return (
    feedBack?.show && (
      <Animated.View
        style={[
          styles.container,
          { top: Platform.OS === "ios" ? StatusBarManager.HEIGHT : 0 },
          feedBack.type === "error" && styles.error,
          {
            transform: [{ translateY: slideAnimation }],
            top: Platform.OS === "ios" ? StatusBarManager.HEIGHT : 0,
          },
        ]}
      >
        <Image
          source={feedBack?.type === "error" ? images.wrong : images.right}
          style={styles.icon}
          resizeMode="contain"
        />

        <Text style={styles.text} numberOfLines={3} ellipsizeMode="tail">
          {feedBack.message}
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.closeButton}
          onPress={handleRemove}
        >
          <Text style={styles.closeButtonText}>{language.close}</Text>
        </TouchableOpacity>
      </Animated.View>
    )
  );
};

const styles = {
  container: {
    backgroundColor: COLORS.lightGreen,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  error: {
    backgroundColor: COLORS.danger,
  },
  icon: {
    width: 25,
    height: 25,
    marginRight: 10,
  },
  text: {
    color: "#fff",
    flex: 1,
    fontFamily: FONT.notoSansMedium,
    padding: 5,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: FONT.notoSansBold,
  },
};

export default GlobalMessagePopUp;
