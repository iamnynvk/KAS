import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { COLORS, FONT } from "../Constants";

export const LoadingOverlayRef = React.createRef();

export const processLoading = (
  visible,
  timeout,
  ref,
  message = "",
  callback
) => {
  if (ref.current) {
    ref.current.updateLoadingVisibility(visible, timeout, message);
    return callback ? callback() : true;
  }
  return false;
};

class LoadingOverlay extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      visible: false,
      message: null,
    };
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackPress
    );
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  handleBackPress = () => {
    if (this.state.visible) {
      return true;
    }
  };

  static show = (message = "", timeout = null) => {
    if (!processLoading(true, timeout, LoadingOverlayRef, message)) {
      this.setState({ visible: true });
      const waitingForLoadingOverlayRef = setInterval(() => {
        processLoading(true, timeout, LoadingOverlayRef, message, () => {
          clearInterval(waitingForLoadingOverlayRef);
        });
      }, 100);
    }
  };

  static hide = (timeout = null) => {
    if (!processLoading(false, timeout, LoadingOverlayRef)) {
      this.setState({ visible: false });
      const waitingForLoadingOverlayRef = setInterval(() => {
        processLoading(false, timeout, LoadingOverlayRef, null, () => {
          clearInterval(waitingForLoadingOverlayRef);
        });
      }, 100);
    }
  };

  updateLoadingVisibility = (visible, timeout, message) => {
    this.setState({ visible, message });
    if (timeout) {
      setTimeout(() => {
        this.setState({ visible: !visible, message: "" });
      }, timeout);
    }
  };

  toggleVisible = () => {
    const visible = !this.state.visible;
    this.setState({ visible });
  };

  render() {
    const { visible, message } = this.state;

    if (!visible) {
      return null;
    }

    return (
      <View style={styles.modalContainer}>
        <View style={styles.modalOverlay} />
        <View style={styles.animationContainer}>
          <ActivityIndicator size="small" color={COLORS.white} />
          {message && <Text style={styles.loadingText}>{message}</Text>}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.secondary,
    opacity: 0.8,
  },
  animationContainer: {
    alignSelf: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: COLORS.white,
    marginTop: 10,
    maxWidth: "80%",
    fontFamily: FONT.notoSansMedium,
    fontSize: 16,
  },
});

export default LoadingOverlay;
