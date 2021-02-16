import { useState, useEffect } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import update from "immutability-helper";

import Bin from "./Bin";
import mockData from "./mock_data";
import State from "./state";

const fetchData = ({ setState, setError }) => {
  // TODO: query the server here instead.
  // fetch("/bins", { headers: { accept: "application/json" } })
  //   .then((res) => res.json())
  //   .then(
  //     (result) => {
  //       let bins = {};
  //       result.bins.forEach((x) => {
  //         bins[x.id] = x;
  //       });
  //       setBins(bins);
  //     },
  //     (error) => {
  //       setError(error);
  //     }
  //   );
  const response = mockData;
  const state = State.fromJson(response);
  setError(null);
  setState(state);
};

const moveItem = (state, dragResult) => {
  const { source, destination, draggableId } = dragResult;

  if (!destination) {
    return null;
  }

  const srcBin = state.bins[source.droppableId];
  const destBin = state.bins[destination.droppableId];

  if (srcBin === destBin) {
    if (destination.index === source.index) {
      return null;
    }
    const newState = update(state, {
      bins: {
        [source.droppableId]: {
          order: {
            $splice: [
              [source.index, 1],
              [destination.index, 0, draggableId],
            ],
          },
        },
      },
    });
    return newState;
  } else {
    // Item moved to a different bin.
    const item = srcBin.children[draggableId];
    const newState = update(state, {
      bins: {
        [source.droppableId]: {
          order: {
            $splice: [[source.index, 1]],
          },
          children: {
            $unset: [draggableId],
          },
        },
        [destination.droppableId]: {
          order: {
            $splice: [[destination.index, 0, draggableId]],
          },
          children: {
            [draggableId]: { $set: item },
          },
        },
      },
    });
    return newState;
  }
};

const BinList = (_props) => {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData({ setState, setError });
  }, []); // empty deps array means run once

  const onDragEnd = (result) => {
    const newState = moveItem(state, result);
    if (newState !== null) {
      setState(newState);
    }
  };

  const onUpdate = (binId, newBinData) => {
    // TODO: readd back, currently broken.
    // console.log("old bins", bins);
    // let newBins = { ...bins };
    // newBins[binId] = newBinData;
    // console.log("new bins", newBins);
    // setBins(newBins);
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (state === null) {
    return <div>Loading...</div>;
  } else {
    return (
      <DragDropContext onDragEnd={onDragEnd}>
        {state.order.map((id) => (
          <Bin
            key={id}
            {...state.bins[id]}
            onUpdate={(data) => onUpdate(id, data)}
          />
        ))}
      </DragDropContext>
    );
  }
};

export default BinList;
