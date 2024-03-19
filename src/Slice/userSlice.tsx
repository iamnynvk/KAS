import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../Config/Axios/axiosInstance";

interface IUserSlice {
  userData: object;
  accessToken: string;
  refreshToken: string;
  roles: any;
  userRole: any;
  userAttendanceData: object;
  fcmToken: any;
}

const initialState: IUserSlice = {
  userData: {},
  accessToken: "",
  refreshToken: "",
  roles: null,
  userRole: null,
  userAttendanceData: {},
  fcmToken: null,
};

export const updateAccessToken = createAsyncThunk(
  "updateToken",
  async (tokens: any) => {
    const response = await axiosInstance.post("/token/refresh/", {
      refresh: tokens,
    });
    return response?.data?.access;
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData(state, action) {
      state.userData = action?.payload;
    },
    setAccessToken(state, action) {
      state.accessToken = action.payload;
    },
    setRefreshToken(state, action) {
      state.refreshToken = action.payload;
    },
    setRoles(state, action) {
      state.roles = action.payload;
    },
    setUserRole(state, action) {
      state.userRole = action.payload;
    },
    setUserAttendanceData(state, action) {
      state.userAttendanceData = action?.payload;
    },
    setFcmToken(state, action) {
      state.fcmToken = action?.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(updateAccessToken.fulfilled, (state, action) => {
        console.log(
          "Updated Access-Token from User-Slices ---->",
          action.payload
        );
        state.accessToken = action.payload;
      })
      .addCase(updateAccessToken.rejected, (state, action) => {
        state.accessToken = "";
      });
  },
});

export const {
  setUserData,
  setAccessToken,
  setRefreshToken,
  setRoles,
  setUserRole,
  setUserAttendanceData,
  setFcmToken,
} = userSlice.actions;
export default userSlice.reducer;
