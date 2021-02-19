const data = {
  children: {
    "bin-0": {
      id: "bin-0",
      name: "Bin 0",
      children: {
        "item-1": {
          id: "item-1",
          name: "Foobar",
        },
        "item-2": {
          id: "item-2",
          name: "Foobar 2",
        },
        "item-3": {
          id: "item-3",
          name: "Foobar 3",
        },
      },
      order: ["item-3", "item-2", "item-1"],
    },
    "bin-1": {
      id: "bin-1",
      name: "Bin 1",
      children: {
        "item-11": {
          id: "item-11",
          name: "Foobar 11",
        },
        "item-12": {
          id: "item-12",
          name: "Foobar 12",
        },
        "item-13": {
          id: "item-13",
          name: "Foobar 13",
        },
        "item-14": {
          id: "item-14",
          name: "Foobar 14",
        },
      },
      order: ["item-11", "item-12", "item-13", "item-14"],
    },
  },
  order: ["bin-0", "bin-1"],
};

export default data;
