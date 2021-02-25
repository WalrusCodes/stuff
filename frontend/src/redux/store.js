import { configureStore } from "@reduxjs/toolkit";
import reduxWebSocket from "@giantmachines/redux-websocket";

import binsReducer from "../features/bins";

const rootReducer = binsReducer;

const wsMiddleware = reduxWebSocket({ reconnectOnClose: true });

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Don't complain about timestamp objects (and some others) in the
      // actions that redux-websocket dispatches.
      serializableCheck: {
        ignoredActions: [
          "REDUX_WEBSOCKET::CLOSED",
          //   "REDUX_WEBSOCKET::CONNECT",
          //   "REDUX_WEBSOCKET::DISCONNECT",
          "REDUX_WEBSOCKET::ERROR",
          "REDUX_WEBSOCKET::OPEN",
          "REDUX_WEBSOCKET::MESSAGE",
          //   "REDUX_WEBSOCKET::RECONNECT_ATTEMPT",
        ],
        ignoredActionPaths: ["meta.timestamp", "meta.originalAction"],
      },
    }).concat(wsMiddleware),
});

export default store;
