use std::collections::HashMap;

use serde::Serialize;

pub mod dummy;

/// Describes whether a given node is an item or a bin.
#[derive(Debug, Serialize, Clone)]
pub enum NodeType {
    Bin,
    Item,
    // Top level state for which "id" and "name" are ignored.
    State,
}

/// A node is an Item or a Bin (container of Items) or State. We use a common type to allow
/// standardized handling of metadata, photos, etc.
#[derive(Debug, Serialize, Clone)]
pub struct Node {
    id: String,
    name: String,
    node_type: NodeType,
    // Mapping from ids to Node entries.
    children: HashMap<String, Node>,
    // Order that the children should be presented. Each key in "children" should have an entry in
    // "order".
    order: Vec<String>,
}

impl Node {
    pub fn make_state() -> Node {
        Node {
            id: "".to_string(),
            name: "".to_string(),
            node_type: NodeType::State,
            children: HashMap::new(),
            order: Vec::new(),
        }
    }
    pub fn add_empty_bin(&mut self, id: &str, name: &str) -> &mut Node {
        let bin = Node {
            id: id.to_string(),
            name: name.to_string(),
            node_type: NodeType::Bin,
            children: HashMap::new(),
            order: Vec::new(),
        };
        assert!(!self.children.contains_key(id));
        self.children.insert(id.to_string(), bin);
        self.order.push(id.to_string());
        self.children.get_mut(id).unwrap()
    }

    pub fn make_item(id: &str, name: &str) -> Node {
        Node {
            id: id.to_string(),
            name: name.to_string(),
            node_type: NodeType::Item,
            children: HashMap::new(),
            order: Vec::new(),
        }
    }

    pub fn add_item(&mut self, id: &str, name: &str) -> &mut Node {
        assert!(!self.children.contains_key(id));
        self.children
            .insert(id.to_string(), Self::make_item(id, name));
        self.order.push(id.to_string());
        self.children.get_mut(id).unwrap()
    }
}

/// Interface to the database that stores the data.
// TODO: switch all return values to have Result<...>.
pub trait Database {
    /// Returns the state of the whole database.
    fn get_bins(&self) -> Node;
    /// Adds an item to the end of the given bin, returns the newly inserted node.
    fn add_item(&self, bin_id: &str, name: &str) -> Node;
    /// Moves item to a given order position in given bin.
    fn move_item(&self, item_id: &str, bin_id: &str, location: usize);
}
