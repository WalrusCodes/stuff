// Converts a list to 1) an object, keyed by item.id, and 2) original order
// given as a list of item.ids.
function listToObjectAndOrder(list) {
  return [
    Object.fromEntries(list.map((item) => [item.id, item])),
    list.map((item) => item.id),
  ];
}

// Defines one bin or item.
//
// Bins have children, items don't.
class Node {
  constructor({ id, name, children, order }) {
    this.id = id;
    this.name = name;
    // Mapping from ids to Nodes.
    this.children = children;
    // List of Node ids.
    this.order = order;
  }

  // Parses Node from a JSON object that the server API gave us.
  static fromJson(jsonObject) {
    const { id, name, children } = jsonObject;
    if (children) {
      const childrenNodes = children.map((node) => Node.fromJson(node));
      const [childrenObjects, order] = listToObjectAndOrder(childrenNodes);
      return new Node({ id, name, children: childrenObjects, order });
    } else {
      return new Node({ id, name });
    }
  }
}

// Describes the top level state of the application.
class State {
  constructor({ bins, order }) {
    // All the bins we know about, mapping from bin ids to Nodes.
    this.bins = bins;
    // List of bin ids, the order we should display the bins in.
    this.order = order;
  }

  // Parses State from a JSON object that the server API gave us on /list.
  static fromJson(json) {
    const b = json.bins.map((b) => Node.fromJson(b));
    const [bins, order] = listToObjectAndOrder(b);
    return new State({ bins, order });
  }
}

export default State;
