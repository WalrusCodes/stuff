import { useEffect } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";

import Bin from "./Bin";
import { fetchData, binsItemMoved } from "./";

const BinList = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchData());
  }, [dispatch]);

  const [status, errorMessage] = useSelector((state) => [
    state.status,
    state.errorMessage,
  ]);
  const binOrder = useSelector((state) => state.binOrder);
  const onDragEnd = (result) => dispatch(binsItemMoved(result));

  if (status === "idle" || status === "loading") {
    return <div>Loading...</div>;
  } else if (status === "error") {
    return <div>Error: {errorMessage}</div>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {binOrder.map((id) => (
        <Bin id={id} key={id} />
      ))}
    </DragDropContext>
  );
};

export default BinList;
