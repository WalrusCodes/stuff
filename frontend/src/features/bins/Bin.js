import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import { useState } from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";

import "./Bin.css";
import { addItem, deleteItem } from "../../api";

const BinMetadata = ({ id }) => {
  return <div className="BinMetadata">id: {id}</div>;
};

const BinItem = ({ binId, id, index, name }) => {
  const dispatch = useDispatch();
  const onClick = () => dispatch(deleteItem({ binId, id }));

  return (
    <Draggable draggableId={id} index={index}>
      {(provided) => (
        <ListGroup.Item {...provided.draggableProps} ref={provided.innerRef}>
          <span className="DragHandle" {...provided.dragHandleProps}>
            dragme
          </span>
          Item {name}
          <DropdownButton
            size="sm"
            variant="outline-secondary"
            title="..."
            as="span"
            style={{ float: "right" }}
          >
            <Dropdown.Item onClick={onClick}>Delete</Dropdown.Item>
          </DropdownButton>
        </ListGroup.Item>
      )}
    </Draggable>
  );
};

// Form input for adding a new item to the bin.
const NewBinItem = ({ binId }) => {
  const [name, setName] = useState("");
  const dispatch = useDispatch();
  // Whether we have a POST request pending to add the item.
  // const [pending, setPending] = useState(false);
  const pending = false;

  // When form is submitted (<enter> is pressed on the "Add Item" line), we
  // mark the box read-only and fire off a POST request. If it succeeds, it
  // will return the new Node element which we pass to the onAdd function from
  // props.
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name || pending) {
      return;
    }

    // TODO: re-add support for showing pending.
    dispatch(addItem({ binId, name }));
    setName("");
  };
  return (
    <ListGroup.Item>
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Control
            value={name}
            type="text"
            name="name"
            placeholder="Add item"
            readOnly={pending}
            onChange={(event) => setName(event.target.value)}
          />
        </Form.Group>
      </Form>
    </ListGroup.Item>
  );
};

const Bin = ({ id: binId }) => {
  // "id" is passed in via props. We then grab the details about the bin from
  // the state using this id.
  const bin = useSelector((state) => state.bins[binId]);
  const { name, children, order, locked } = bin;

  // TODO: do we want to lock the bin while items within it are moved and such?
  const maybeLocked = {};
  if (locked) {
    // TODO: lock the bin.
  }

  return (
    <div className="Bin" {...maybeLocked}>
      <div className="BinName">Bin {name}</div>
      <BinMetadata id={binId} />
      <div>
        <Droppable droppableId={binId}>
          {(provided) => (
            <ListGroup ref={provided.innerRef} {...provided.droppableProps}>
              {order.map((id, index) => (
                <BinItem
                  key={id}
                  binId={binId}
                  index={index}
                  {...children[id]}
                />
              ))}
              {provided.placeholder}
              <NewBinItem key={`${binId}-new`} binId={binId} />
            </ListGroup>
          )}
        </Droppable>
      </div>
    </div>
  );
};

export default Bin;
