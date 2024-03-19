import { createSlice } from "@reduxjs/toolkit";

interface IScanSlice {
  scanData: boolean;
  back: any;
  front:any;
}

const initialState: IScanSlice = {
  scanData: false,
  back: null,
  front: null,
};

const scanSlice = createSlice({
  name: "scan",
  initialState,
  reducers: {
    setScanData(state, action) {
      state.scanData = action?.payload;
    },
    setBackCamera(state, action) {
      state.back = action?.payload;
    },
    setFrontCamera(state,action){
      state.front = action?.payload;
    },
  },
});

export const { setScanData, setBackCamera,setFrontCamera } = scanSlice.actions;
export default scanSlice.reducer;
