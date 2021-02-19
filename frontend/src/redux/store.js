import { configureStore } from "@reduxjs/toolkit";

import binsReducer from "../features/bins";

const rootReducer = binsReducer;

const store = configureStore({
  reducer: rootReducer,
});

export default store;
