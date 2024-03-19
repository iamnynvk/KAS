import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

import preferenceSlice from "../Slice/preferenceSlice";
import userSlice from "../Slice/userSlice";
import scanSlice from "../Slice/scanSlice";
import feedbackSlice from "../Slice/feedbackSlice";
import ImageSlice from "../Slice/ImageSlice";

const persistConfig = {
  key: "root",
  whitelist: ["Preference", "user", "scan", "feedback"],
  storage: AsyncStorage,
};

const reducer = combineReducers({
  Preference: preferenceSlice,
  user: userSlice,
  scan: scanSlice,
  feedback: feedbackSlice,
  image:ImageSlice,
});

const persistedReducer = persistReducer(persistConfig, reducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
});

const persistor = persistStore(store);
export { persistor };
