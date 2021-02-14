import "./Bin.css";

import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import { useState } from "react";

const BinMetadata = ({ id }) => {
  return <div className="BinMetadata">id: {id}</div>;
};

const BinItem = ({ name }) => {
  return (
    <ListGroup.Item>
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
  const { id, name, children, onUpdate } = props;

  const onAdd = (newItem) => {
    onUpdate({ id, name, children: [...children, newItem] });
  };

  return (
    <div className="Bin">
      <div className="BinName">Bin {name}</div>
      <BinMetadata id={id} />
      <ListGroup>
        {children.map((item) => (
          <BinItem key={item.id} {...item} />
        ))}
        <NewBinItem key={`${id}-new`} id={id} onAdd={onAdd} />
      </ListGroup>
    </div>
  );
};

export default Bin;
