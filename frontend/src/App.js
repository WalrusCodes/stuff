import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "react-bootstrap/Navbar";

import "./App.css";
import BinList from "./features/bins/BinList";

function App() {
  return (
    <div className="App">
      <Navbar bg="light">
        <Navbar.Brand>STUFF</Navbar.Brand>
      </Navbar>
      <BinList />
    </div>
  );
}

export default App;
