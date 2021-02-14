use super::{Database, Node, NodeType};
use std::{collections::HashMap, sync::Mutex};

#[derive(Default)]
pub struct DummyDatabase {
    bins: Mutex<HashMap<String, Node>>,
    id_counter: Mutex<u32>,
}

impl DummyDatabase {
    fn get_id(&self, prefix: &str) -> String {
        let mut lock = self.id_counter.lock().unwrap();
        let result = *lock;
        *lock += 1;
        format!("{}-{}", prefix, result)
    }

    pub fn new() -> DummyDatabase {
        let mut db = DummyDatabase::default();
        db.add_dummy_data();
        db
    }

    fn add_dummy_data(&mut self) {
        for _ in 1..=3 {
            let bin_id = self.get_id("bin");
            let mut bin = Node::make_empty_bin(&bin_id, &bin_id);

            for _ in 1..5 {
                let item_id = self.get_id("item");
                bin.children.push(Node::make_item(&item_id, &item_id));
            }
            self.bins.lock().unwrap().insert(bin_id, bin);
        }
    }
}

impl Database for DummyDatabase {
    fn get_bins(&self) -> Vec<Node> {
        let mut out = self
            .bins
            .lock()
            .unwrap()
            .values()
            .cloned()
            .collect::<Vec<Node>>();
        out.sort_by(|x, y| x.name.cmp(&y.name));
        out
    }

    // TODO: have this method (and others) return Result so that we can pass an error to the
    // client.
    fn add_item(&self, bin_id: &str, name: &str) -> Node {
        let item_id = self.get_id("item");
        let node = Node {
            id: item_id,
            name: name.to_string(),
            node_type: NodeType::Item,
            children: Vec::new(),
        };
        let mut lock = self.bins.lock().unwrap();
        if !lock.contains_key(bin_id) {
            log::error!("no such bin {}", bin_id);
            log::info!("bins: {:?}", lock);
        } else {
            lock.get_mut(bin_id).unwrap().children.push(node.clone());
            log::info!("added node: {:?}", &node);
        }
        node
    }
}
