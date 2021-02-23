import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "react-bootstrap/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

import "./App.css";
import BinList from "./features/bins/BinList";
import { fetchData } from "./api";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchData());
  }, [dispatch]);

  const [loading, errorMessage] = useSelector((state) => [
    state.loading,
    state.errorMessage,
  ]);

  let maybeError = null;
  if (errorMessage) {
    maybeError = <div className="Error">Error: {errorMessage}</div>;
  }

  let maybeLoading = null;
  if (loading) {
    maybeLoading = <div>Loading...</div>;
  }

  return (
    <div className="App">
      <Navbar bg="light">
        <Navbar.Brand>STUFF</Navbar.Brand>
      </Navbar>
      {maybeError}
      {maybeLoading}
      <BinList />
    </div>
  );
}

export default App;
