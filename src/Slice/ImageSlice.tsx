import { createSlice } from "@reduxjs/toolkit";

interface imageSlice {
  captureImage: any;
}

const initialState: imageSlice = {
  captureImage: null,
};

const imageSlice = createSlice({
  name: "image",
  initialState,
  reducers: {
    setCaptureImage(state, action) {
      state.captureImage = action?.payload;
    },
    clearCaptureImage(state){
      state.captureImage = null;
    }
  },
});

export const { setCaptureImage,clearCaptureImage } = imageSlice.actions;
export default imageSlice.reducer;
