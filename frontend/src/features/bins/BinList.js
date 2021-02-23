import { DragDropContext } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";

import Bin from "./Bin";
import { moveItem } from "../../api";

const BinList = () => {
  const dispatch = useDispatch();
  const binOrder = useSelector((state) => state.binOrder);
  const onDragEnd = (result) => dispatch(moveItem(result));

  return (
    <div>
      <DragDropContext onDragEnd={onDragEnd}>
        {binOrder.map((id) => (
          <Bin id={id} key={id} />
        ))}
      </DragDropContext>
    </div>
  );
};

export default BinList;
