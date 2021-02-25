import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "react-bootstrap/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { connect } from "@giantmachines/redux-websocket";

import "./App.css";
import BinList from "./features/bins/BinList";
import { fetchData } from "./api";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchData());
    const url = new URL("/ws", window.location.href);
    url.protocol = url.protocol.replace("http", "ws");
    dispatch(connect(url.href));
  }, [dispatch]);

  const [loading, errorMessage] = useSelector((state) => [
    state.loading,
    state.errorMessage,
  ]);

  const [wsStatus, wsClients] = useSelector((state) => [
    state.ws.status,
    state.ws.clients,
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
        <Navbar.Text className="ml-auto">
          ws: {wsStatus} ({wsClients})
        </Navbar.Text>
      </Navbar>
      {maybeError}
      {maybeLoading}
      <BinList />
    </div>
  );
}

export default App;
