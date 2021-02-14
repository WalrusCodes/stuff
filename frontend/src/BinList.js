import { useState, useEffect } from "react";

import Bin from "./Bin.js";

const BinList = (_props) => {
  const [bins, setBins] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/bins", { headers: { accept: "application/json" } })
      .then((res) => res.json())
      .then(
        (result) => {
          let bins = {};
          result.bins.forEach((x) => {
            bins[x.id] = x;
          });
          setBins(bins);
        },
        (error) => {
          setError(error);
        }
      );
  }, []); // empty deps array means run once

  const onUpdate = (binId, newBinData) => {
    console.log("yaya", binId, newBinData);
    console.log("old bins", bins);
    let newBins = { ...bins};
    newBins[binId] = newBinData;
    console.log("new bins", newBins);
    setBins(newBins);
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (bins === null) {
    return <div>Loading...</div>;
  } else {
    return Object.values(bins).map((bin) => (
      <Bin key={bin.id} {...bin} onUpdate={(data) => onUpdate(bin.id, data)} />
    ));
  }
};

export default BinList;
