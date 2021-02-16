import "./Bin.css";

import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import { useState } from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";

const BinMetadata = ({ id }) => {
  return <div className="BinMetadata">id: {id}</div>;
};

const BinItem = ({ id, index, name }) => {
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
            <Dropdown.Item>Delete</Dropdown.Item>
          </DropdownButton>
        </ListGroup.Item>
      )}
    </Draggable>
  );
};

const NewBinItem = ({ id, onAdd }) => {
  // Value of the item to be added.
  const [name, setName] = useState("");
  // Whether we have a POST request pending to add the item.
  const [pending, setPending] = useState(false);
  // Called when textbox value changes.
  const onChange = (event) => {
    setName(event.target.value);
  };
  // When form is submitted (<enter> is pressed on the "Add Item" line), we
  // mark the box read-only and fire off a POST request. If it succeeds, it
  // will return the new Node element which we pass to the onAdd function from
  // props.
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name || pending) {
      return;
    }

    setPending(true);
    const body = { name: name };

    fetch(`/bins/${id}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then(
        (result) => {
          onAdd(result);
          setName("");
          setPending(false);
        },
        (error) => {
          console.log("Error", error);
          setPending(false);
        }
      );
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
            onChange={onChange}
          />
        </Form.Group>
      </Form>
    </ListGroup.Item>
  );
};

const Bin = (props) => {
  const { id, name, children, order, onUpdate } = props;

  const onAdd = (newItem) => {
    let newChildren = { ...children };
    newChildren[newItem.id] = newItem;
    onUpdate({ id, name, children: newChildren });
  };

  return (
    <div className="Bin">
      <div className="BinName">Bin {name}</div>
      <BinMetadata id={id} />
      <Droppable droppableId={id}>
        {(provided) => (
          <ListGroup ref={provided.innerRef} {...provided.droppableProps}>
            {order.map((id, index) => (
              <BinItem key={id} index={index} {...children[id]} />
            ))}
            {provided.placeholder}
            <NewBinItem key={`${id}-new`} id={id} onAdd={onAdd} />
          </ListGroup>
        )}
      </Droppable>
    </div>
  );
};

export default Bin;
