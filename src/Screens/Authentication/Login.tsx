import React, { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Formik } from "formik";
import { object, string, number } from "yup";
import InputText from "../../Components/InputText";
import { COLORS, images } from "../../Constants";
import SubmitButton from "../../Components/SubmitButton";
import { FONT } from "../../Constants/theme";
import { useDispatch, useSelector } from "react-redux";
import {
  setAccessToken,
  setFcmToken,
  setRefreshToken,
  setRoles,
  setUserData,
  setUserRole,
} from "../../Slice/userSlice";
import { makeAuthenticatedPostRequest } from "../../Config/Axios";

const { width: screenWidth } = Dimensions.get("screen");
const phoneRegExp = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;

// Login validation using yup
let loginValidation = object({
  phone: string()
    .matches(phoneRegExp, "Mobile number is not valid!")
    .required("Mobile number is required!"),
  pin: number()
    .min(4, ({ min }) => `Pin must be at least ${min} characters.`)
    .required("Pin number is required!"),
});

export interface IToggle {
  loading: boolean;
  isClick: boolean;
}

interface IParams {
  phone: string;
  password: string;
  current_token: any;
}

const Login = (props: any) => {
  const dispatch = useDispatch();
  const phoneRef: object = useRef();
  const user_type_pk = [5, 7, 8, 10];
  const pinRef: object = useRef();
  const { fcmToken } = useSelector((state: any) => state.user);
  const [handleToggle, setHandleToggle] = useState<IToggle>({
    loading: false,
    isClick: false,
  });

  // Login Button Handler Here...
  const loginHandler = async (values: any) => {
    setHandleToggle({
      loading: true,
      isClick: true,
    });

    const params: IParams = {
      phone: values.phone,
      password: values.pin,
      current_token: fcmToken,
    };
    try {
      const { data }: any = await dispatch(
        makeAuthenticatedPostRequest("/users/custom-login/", params)
      );
      data?.status === 200 && setRefreshTokens(data?.results);

      setHandleToggle({
        loading: false,
        isClick: false,
      });
    } catch (err: any) {
      console.log("Error from user login APIs called ----", err);
    }
    setHandleToggle({
      loading: false,
      isClick: false,
    });
  };

  const setRefreshTokens = async (res: any) => {
    try {
      dispatch(setUserData(res?.user));
      dispatch(setAccessToken(res?.access));
      dispatch(setRefreshToken(res?.refresh));
      dispatch(setRoles(res?.user?.organization_based_roles));
      dispatch(setFcmToken(res.current_token));

      const findRole = (roles: any) => {
        const userRole = roles.find(({ organization_type_role }: any) => {
          const role_pk = organization_type_role?.role?.pk;
          return user_type_pk.includes(role_pk);
        });
        dispatch(setUserRole(userRole?.organization_type_role.role?.pk));
        props?.navigation.reset({
          index: 0,
          routes: [
            {
              name: "Main",
            },
          ],
        });
      };
      findRole(res?.user?.organization_based_roles);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Formik
      initialValues={{ phone: "", pin: "" }}
      validateOnMount={true}
      validationSchema={loginValidation}
      onSubmit={(values: any) => loginHandler(values)}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        touched,
        isValid,
        errors,
      }: any) => (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS == "ios" ? 40 : 0}
        >
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            <React.Fragment>
              <Image
                source={images.logo}
                resizeMode={"contain"}
                style={styles.imageStyles}
              />
              {/* TextInput Here */}
              <View style={styles.userInputContainer}>
                <InputText
                  refs={phoneRef}
                  placeHolderText={"10 digit mobile number"}
                  isNextFocus={pinRef}
                  isSecure={false}
                  maxLength={10}
                  keyType={"phone-pad"}
                  onBlurInput={handleBlur("phone")}
                  onChange={handleChange("phone")}
                  values={values?.phone}
                  isError={touched.phone && errors.phone}
                />
                {touched.phone && errors.phone && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{errors.phone}</Text>
                  </View>
                )}

                <InputText
                  textContainer={{ marginTop: 20 }}
                  refs={pinRef}
                  placeHolderText={"Pin"}
                  isAutoFocus={false}
                  isSecure={true}
                  keyType={"number-pad"}
                  onBlurInput={handleBlur("pin")}
                  onChange={handleChange("pin")}
                  values={values?.pin}
                  isError={touched.pin && errors.pin}
                />
                {touched.pin && errors.pin && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{errors.pin}</Text>
                  </View>
                )}
              </View>

              {/* Submit Button Here */}
              <View style={styles.submitContainer}>
                <SubmitButton
                  isDisable={!isValid || handleToggle?.isClick}
                  handleSubmitButton={handleSubmit}
                  isLoading={handleToggle?.loading}
                  title={"Submit"}
                />
              </View>
            </React.Fragment>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },
  imageStyles: {
    height: screenWidth / 2,
  },
  userInputContainer: {
    marginTop: 20,
  },
  submitContainer: {
    marginTop: 30,
  },
  textContainer: {
    color: COLORS.white,
    fontSize: 22,
    fontFamily: FONT.notoSansMedium,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.primary,
    alignItems: "center",
    marginStart: 2,
    fontFamily: FONT.notoSansMedium,
  },
});

export default Login;
