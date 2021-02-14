use serde::Serialize;

pub mod dummy;

/// Describes whether a given node is an item or a bin.
#[derive(Debug, Serialize, Clone)]
pub enum NodeType {
    Bin,
    Item,
}

/// A node is an Item or a Bin (container of Items). We use a common type to allow standardized
/// handling of metadata, photos, etc.
#[derive(Debug, Serialize, Clone)]
pub struct Node {
    id: String,
    name: String,
    node_type: NodeType,
    children: Vec<Node>,
}

impl Node {
    pub fn make_empty_bin(id: &str, name: &str) -> Self {
        Node {
            id: id.to_string(),
            name: name.to_string(),
            node_type: NodeType::Bin,
            children: Vec::new(),
        }
    }

    pub fn make_item(id: &str, name: &str) -> Self {
        Node {
            id: id.to_string(),
            name: name.to_string(),
            node_type: NodeType::Item,
            children: Vec::new(),
        }
    }
}

/// Interface to the database that stores the data.
pub trait Database {
    fn get_bins(&self) -> Vec<Node>;
    fn add_item(&self, bin_id: &str, name: &str) -> Node;
}
