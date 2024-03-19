import { createSlice } from "@reduxjs/toolkit";

interface IFeedback {
  show: boolean;
  message: string;
  type: string;
}

const initialState: IFeedback = {
  show: false,
  message: "",
  type: "",
};

const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {
    showFeedback(state, action) {
      state.show = true;
      state.message = action.payload.message;
      state.type = action.payload.type;
    },
    hideFeedback(state) {
      state.show = false;
      state.message = "";
      state.type = "";
    },
  },
});

export const { showFeedback, hideFeedback } = feedbackSlice.actions;
export default feedbackSlice.reducer;
