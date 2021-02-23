import { createAsyncThunk } from "@reduxjs/toolkit";

import mockData from "./redux/mock_data";

// Whether to use dummy data instead of talking to the backend.
const useDummyData = true; // false;

// Sends a REST request to given path with optional JSON data, parses response
// as JSON. If call fails, raises an error.
const callApi = async (path, { body = null, method = "GET" } = {}) => {
  // console.log(`callApi(${path}, body=`, body, `method=${method})`);
  const options = {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const response = await fetch(path, options);
  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
  const results = await response.json();
  return results;
};

// Kicks off a request to fetch initial data.
export const fetchData = createAsyncThunk("bins/initialFetch", async () => {
  if (useDummyData) {
    await new Promise((r) => setTimeout(r, 1000));
    return mockData;
  } else {
    return callApi("/bins");
  }
});

// For now, generate dummy sequential IDs when items are inserted.
let dummyIdCounter = 50;

export const addItem = createAsyncThunk(
  "bins/itemAdded",
  async ({ binId, name }) => {
    if (useDummyData) {
      await new Promise((r) => setTimeout(r, 500));
      dummyIdCounter++;
      return {
        id: `item-${dummyIdCounter}`,
        name,
      };
    } else {
      return callApi(`/bins/${binId}`, {
        method: "POST",
        body: { name },
      });
    }
  }
);

export const deleteItem = createAsyncThunk(
  "bins/itemDeleted",
  async ({ binId, id }) => {
    if (useDummyData) {
      return;
    }
    // TODO: call API.
  }
);

// Takes drag and drop data coming from react-beautiful-dnd, sends off an API
// request.
export const moveItem = createAsyncThunk(
  "item/moved",
  async ({ source, destination, draggableId }) => {
    if (useDummyData) {
      return;
    }

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      destination.index === source.index
    ) {
      // Didn't move.
      return;
    }

    // dispatch(binLocked(source.droppableId));
    // if (source.droppableId !== destination.droppableId) {
    //   dispatch(binLocked(destination.droppableId));
    // }

    const itemId = draggableId;
    const body = {
      bin_id: destination.droppableId,
      location: destination.index,
    };
    return callApi(`/items/${itemId}/move`, {
      method: "POST",
      body: body,
    });
  }
);
