import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "react-bootstrap/Navbar";
import Bin from "./Bin.js";
import { useFetch } from "react-async";

function App() {
  const { data, error } = useFetch("/list", {
    headers: { accept: "application/json" },
  });

  // TODO: make this less ugly.
  let out;
  if (error) {
    out = `error: ${error.message}`;
  } else if (data) {
    console.log(data);
    out = data.bins.map((x) => <Bin key={x.id} {...x} />);
  } else {
    out = "pending";
  }

  return (
    <div className="App">
      <Navbar bg="light">
        <Navbar.Brand>STUFF</Navbar.Brand>
      </Navbar>
      {out}
    </div>
  );
}

export default App;
