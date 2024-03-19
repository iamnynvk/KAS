import React, { useState } from "react";
import {
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ImageBackground,
  View,
} from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";
import { ActivityIndicator, Text } from "react-native-paper";
import AntDesign from "react-native-vector-icons/AntDesign";
import { COLORS } from "../Constants";
import Icons from "react-native-vector-icons/Ionicons";
import { Platform } from "react-native";
import { UrlType } from "../Config/url.config";

const screen = Dimensions.get("window");

const PinchableBox = ({
  imageUri,
  smallImageCStyle,
  isMultiple,
  isBase,
}: any) => {
  const image = [
    {
      url:
        UrlType == "development"
          ? isBase
            ? imageUri
            : `http://143.110.254.46:8888${imageUri}`
          : imageUri,
    },
  ];
  const [isOpenImageView, setIsOpenImageView] = useState(false);
  const [valid, setValid] = useState(true);
  const [loadingImage, setLoadingImage] = useState<boolean>(true);
  const noImageUri =
    "https://thumbs.dreamstime.com/b/no-image-available-icon-flat-vector-no-image-available-icon-flat-vector-illustration-132482953.jpg";

  return isOpenImageView ? (
    <Modal
      style={styles.mainView}
      onRequestClose={() => setIsOpenImageView(false)}
    >
      <AntDesign
        onPress={() => setIsOpenImageView(false)}
        name="close"
        size={30}
        color="#FFFFFF"
        style={[styles.closeIcon, { top: Platform.OS == "ios" ? 40 : 10 }]}
      />
      <ImageViewer
        imageUrls={image}
        renderIndicator={() => null}
        enableSwipeDown
        onSwipeDown={() => setIsOpenImageView(false)}
      />
    </Modal>
  ) : (
    <TouchableOpacity
      activeOpacity={1}
      style={[styles.smallImageStyle, smallImageCStyle]}
      onPress={() => valid && imageUri && setIsOpenImageView(true)}
    >
      {loadingImage && (
        <View
          style={{
            zIndex: 99,
            flex: 1,
            top: smallImageCStyle.height / 2,
          }}
        >
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      )}

      <ImageBackground
        onError={() => setValid(false)}
        style={[
          styles.smallImageStyle,
          { height: "100%", width: "100%", position: "relative" },
        ]}
        source={{
          uri: image.length > 0 ? image[0].url : noImageUri,
          cache: "force-cache",
        }}
        resizeMode={"cover"}
        resizeMethod={"resize"}
        onLoadEnd={() => setLoadingImage(false)}
      >
        {isMultiple > 1 && (
          <View style={{ position: "absolute", right: 10, top: 10 }}>
            <Icons name="ios-copy-sharp" color={COLORS.white} size={24} />
          </View>
        )}
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default PinchableBox;

const styles = StyleSheet.create({
  mainView: {
    position: "absolute",
    height: screen.height,
    width: screen.width,
    zIndex: 10000,
    backgroundColor: "#F5FCFF",
  },
  closeIcon: {
    right: 10,
    zIndex: 10,
    position: "absolute",
  },
  smallImageStyle: {
    width: 60,
    height: 80,
  },
});

PinchableBox.defaultProps = {
  smallImageCStyle: {},
  imageUri: "",
};
