import { createSlice } from "@reduxjs/toolkit";

interface IPreference {
  languageIndex: number;
  language: object;
}

const initialState: IPreference = {
  languageIndex: 0,
  language: {},
};

const preferenceSlice = createSlice({
  name: "preference",
  initialState,
  reducers: {
    setLanguage(state, action) {
      state.languageIndex = action?.payload;
    },
    setActiveLanguage(state, action) {
      state.language = action?.payload;
    },
  },
});

export const { setLanguage, setActiveLanguage } = preferenceSlice.actions;
export default preferenceSlice.reducer;
