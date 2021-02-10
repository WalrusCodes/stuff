import "./Bin.css";

import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";

const BinMetadata = ({ id }) => {
  return <div className="BinMetadata">id: {id}</div>;
};

const BinItem = ({ name }) => {
  return <ListGroup.Item>Item {name}</ListGroup.Item>;
};

const NewBinItem = () => {
  return (
    <ListGroup.Item>
      <Form.Group>
        <Form.Control type="text" placeholder="Add item" />
      </Form.Group>
    </ListGroup.Item>
  );
};

const Bin = (props) => {
  const { id, name, children } = props;

  return (
    <div className="Bin">
      <div className="BinName">Bin {name}</div>
      <BinMetadata id={id} />
      <ListGroup>
        {children.map((item) => (
          <BinItem key={item.id} {...item} />
        ))}
        <NewBinItem key={`${id}-new`} />
      </ListGroup>
    </div>
  );
};

export default Bin;
