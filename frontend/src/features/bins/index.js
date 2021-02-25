import { createReducer } from "@reduxjs/toolkit";

import { fetchData, addItem, moveItem, deleteItem } from "../../api.js";

const initialState = {
  loading: false,
  errorMessage: "",
  bins: {},
  binOrder: [],
  // Websocket connection status.
  ws: {
    status: "",
    clients: 0,
  },
};

const reducer = createReducer(initialState, {
  [fetchData.pending.type]: (state) => {
    state.loading = true;
  },
  // When initial data load completes, store the data.
  [fetchData.fulfilled.type]: (state, action) => {
    state.bins = action.payload.children;
    state.binOrder = action.payload.order;
    state.loading = false;
    // "current" from @reduxjs/toolkit turns the "state" proxy into real data
    // so it can be logged.
    // console.log("done", current(state));
  },
  [fetchData.rejected.type]: (state, action) => {
    state.loading = false;
    state.errorMessage = action.error;
  },
  // An item was added to a bin.
  [addItem.fulfilled.type]: (state, action) => {
    const binId = action.meta.arg.binId;
    const item = action.payload;
    const bin = state.bins[binId];
    bin.children[item.id] = item;
    bin.order.push(item.id);
  },
  // An item was deleted from a bin.
  [deleteItem.fulfilled.type]: (state, action) => {
    const { binId, id } = action.meta.arg;
    const bin = state.bins[binId];
    delete bin.children[id];
    const idx = bin.order.indexOf(id);
    bin.order.splice(idx, 1);
  },
  // Lock the source and destination bins. They will get unlocked when we get
  // updated bins from the server.
  [moveItem.pending.type]: (state, action) => {
    const { source, destination } = action.meta.arg;
    state.bins[source.droppableId].locked = true;
    state.bins[destination.droppableId].locked = true;
  },
  // An item was dragged inside the bin or between bins.
  // TODO: what do we want to return from the server?
  [moveItem.fulfilled.type]: (state, action) => {
    // Drag and Drop data coming from react-beautiful-dnd.
    const { source, destination, draggableId } = action.meta.arg;

    if (!destination) {
      return;
    }

    const srcBin = state.bins[source.droppableId];
    const destBin = state.bins[destination.droppableId];

    if (srcBin === destBin) {
      // Item moved within the same bin.
      if (destination.index === source.index) {
        // Didn't move.
        return;
      }
      srcBin.order.splice(source.index, 1);
      srcBin.order.splice(destination.index, 0, draggableId);
    } else {
      // Item moved to a different bin.
      const item = srcBin.children[draggableId];
      srcBin.order.splice(source.index, 1);
      delete srcBin.children[draggableId];
      destBin.order.splice(destination.index, 0, draggableId);
      destBin.children[draggableId] = item;
    }
  },
  // Websocket status.
  "REDUX_WEBSOCKET::CONNECT": (state) => {
    state.ws.status = "connecting";
  },
  "REDUX_WEBSOCKET::OPEN": (state) => {
    state.ws.status = "connected";
  },
  "REDUX_WEBSOCKET::CLOSED": (state) => {
    state.ws.status = "disconnected";
  },
  "REDUX_WEBSOCKET::MESSAGE": (state, action) => {
    const json  = action.payload.message;
    const msg = JSON.parse(json);
    if (msg.ws && msg.ws.clients !== undefined) {
      state.ws.clients = msg.ws.clients;
    }
  },
});

export default reducer;
