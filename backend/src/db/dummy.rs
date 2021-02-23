use super::{Database, Node};
use std::sync::Mutex;

// #[derive(Default)]
pub struct DummyDatabase {
    top: Mutex<Node>,
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
        let mut db = DummyDatabase {
            top: Mutex::new(Node::make_state()),
            id_counter: Mutex::new(0),
        };
        db.add_dummy_data();
        db
    }

    fn add_dummy_data(&mut self) {
        let mut state = self.top.lock().unwrap();
        for _ in 1..=3 {
            let bin_id = self.get_id("bin");
            let bin = state.add_empty_bin(&bin_id, &bin_id);

            for _ in 1..5 {
                let item_id = self.get_id("item");
                bin.add_item(&item_id, &item_id);
            }
        }
    }
}

impl Database for DummyDatabase {
    fn get_bins(&self) -> Node {
        self.top.lock().unwrap().clone()
    }

    // TODO: have this method (and others) return Result so that we can pass an error to the
    // client.
    fn add_item(&self, bin_id: &str, name: &str) -> Node {
        let mut state = self.top.lock().unwrap();

        // let node = Node {
        //     id: item_id,
        //     name: name.to_string(),
        //     node_type: NodeType::Item,
        //     children: Vec::new(),
        // };
        if !state.children.contains_key(bin_id) {
            log::error!("no such bin {}", bin_id);
            log::info!("bins: {:?}", &state);
            panic!();
        } else {
            let item_id = self.get_id("item");
            let node = state
                .children
                .get_mut(bin_id)
                .unwrap()
                .add_item(&item_id, name);
            log::info!("added node: {:?}", &node);
            node.clone()
        }
    }

    fn move_item(&self, item_id: &str, bin_id: &str, location: usize) {
        log::info!("move_item: {:?} {:?} {:?}", item_id, bin_id, location);
        let mut state = self.top.lock().unwrap();
        let maybe_bin_id = find_bin_with_item_id(&state, item_id);
        if maybe_bin_id.is_none() {
            log::error!("failed to find item {}", item_id);
            return;
        }
        // Remove node from source bin.
        let node = {
            let source_bin = state.children.get_mut(&maybe_bin_id.unwrap()).unwrap();
            source_bin.order.retain(|x| *x != item_id);
            source_bin.children.remove(item_id).unwrap()
        };
        // Add to destination bin.
        let dest_bin = state.children.get_mut(bin_id).unwrap();
        dest_bin.order.insert(location, item_id.to_string());
        dest_bin.children.insert(item_id.to_string(), node);

        // let node = s
    }
}

fn find_bin_with_item_id(bins: &Node, item_id: &str) -> Option<String> {
    for (bin_id, bin) in bins.children.iter() {
        if bin.children.contains_key(item_id) {
            return Some(bin_id.to_string());
        }
    }
    None
}
