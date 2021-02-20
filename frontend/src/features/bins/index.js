import { createAction, createReducer, current } from "@reduxjs/toolkit";

import mockData from "../../redux/mock_data";

// Actions that can be dispatched against the store to update the state.
export const binsLoading = createAction("bins/loading");
export const binsLoaded = createAction("bins/loaded");
export const binsItemMoved = createAction("bins/item_moved");
export const binsItemAdded = createAction("bins/item_added");
export const binsItemDeleted = createAction("bins/item_deleted");

const initialState = {
  // "idle", "loading", "done", "error"
  status: "idle",
  errorMessage: "",
  bins: {},
  binOrder: [],
};

const reducer = createReducer(initialState, {
  [binsLoading.type]: (state) => {
    state.status = "loading";
  },
  // When remote data arrives, change status to "done" and set data.
  [binsLoaded.type]: (state, action) => {
    console.log(action);
    state.bins = action.payload.children;
    state.binOrder = action.payload.order;
    state.status = "done";
    // "current" turns the "state" proxy into real data so it can be logged.
    console.log("done", current(state));
    // console.log("done");
  },
  // An item was added to a bin.
  [binsItemAdded.type]: (state, action) => {
    const { binId, item } = action.payload;
    const bin = state.bins[binId];
    bin.children[item.id] = item;
    bin.order.push(item.id);
  },
  // An item was deleted from a bin.
  [binsItemDeleted.type]: (state, action) => {
    const { binId, id } = action.payload;
    console.log(binId, id);
    const bin = state.bins[binId];
    delete bin.children[id];
    const idx = bin.order.indexOf(id);
    bin.order.splice(idx, 1);
  },
  // An item was dragged inside the bin or between bins.
  [binsItemMoved.type]: (state, action) => {
    // Drag and Drop data coming from react-beautiful-dnd.
    const { source, destination, draggableId } = action.payload;

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
});

// Kicks off a request to fetch initial data.
export const fetchData = () => async (dispatch) => {
  dispatch(binsLoading());
  // TODO: remove this simulated loading time.
  await new Promise((r) => setTimeout(r, 1000));
  // TODO: handle errors.
  dispatch(binsLoaded(mockData));
};

// For now, generate dummy sequential IDs when items are inserted.
let dummyIdCounter = 50;

export const addItem = ({ binId, name }) => async (dispatch) => {
  // TODO: remove this simulated loading time.
  await new Promise((r) => setTimeout(r, 500));
  // TODO: handle errors.
  dummyIdCounter++;
  dispatch(
    binsItemAdded({
      binId,
      item: {
        id: `item-${dummyIdCounter}`,
        name,
      },
    })
  );

  // TODO: re-add this back.
  // const body = { name: name };
  // fetch(`/bins/${id}`, {
  //   method: "POST",
  //   headers: {
  //     Accept: "application/json",
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(body),
  // })
  //   .then((res) => res.json())
  //   .then(
  //     (result) => {
  //       onAdd(result);
  //       setName("");
  //       setPending(false);
  //     },
  //     (error) => {
  //       console.log("Error", error);
  //       setPending(false);
  //     }
  //   );
};

export const deleteItem = ({ binId, id }) => async (dispatch) => {
  // TODO: call API.
  dispatch(binsItemDeleted({ binId, id }));
};

export default reducer;
