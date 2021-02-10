use actix_web::{middleware, web, App, HttpResponse, HttpServer, Responder};
use serde::Serialize;
use std::env;

/// Describes whether a given node is an item or a bin.
#[derive(Serialize, Clone)]
enum NodeType {
    Bin,
    Item,
}

/// A node is an item or a bin (container for items). We use a common type to allow standardized
/// handling of metadata, photos, etc.
#[derive(Serialize, Clone)]
struct Node {
    id: String,
    name: String,
    node_type: NodeType,
    children: Vec<Node>,
}

impl Node {
    fn make_empty_bin(id: &str, name: &str) -> Self {
        Node {
            id: id.to_string(),
            name: name.to_string(),
            node_type: NodeType::Bin,
            children: Vec::new(),
        }
    }

    fn make_item(id: &str, name: &str) -> Self {
        Node {
            id: id.to_string(),
            name: name.to_string(),
            node_type: NodeType::Item,
            children: Vec::new(),
        }
    }
}

/// Response for a "/list" request.
#[derive(Serialize, Default)]
struct BinList {
    bins: Vec<Node>,
}

/// Handler for "/list" - returns a list of bins containing items.
async fn handle_list() -> impl Responder {
    let mut bin_list = BinList::default();
    let mut id_ctr = 0;
    for _ in 1..=3 {
        let mut bin = Node::make_empty_bin(&format!("bin-{}", id_ctr), &format!("{}", id_ctr));
        id_ctr += 1;

        for _ in 1..5 {
            bin.children.push(Node::make_item(
                &format!("item-{}", id_ctr),
                &format!("{}", id_ctr),
            ));
            id_ctr += 1;
        }

        bin_list.bins.push(bin);
    }
    HttpResponse::Ok().json(bin_list)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    if env::var_os("RUST_LOG").is_none() {
        env::set_var("RUST_LOG", "actix_web=debug,actix_server=debug");
    }
    env_logger::init();

    HttpServer::new(|| {
        App::new()
            .wrap(middleware::Logger::default())
            .route("/list", web::get().to(handle_list))
            .default_service(
                web::resource("").route(web::to(|| HttpResponse::NotFound().body("nope"))),
            )
    })
    .bind("0.0.0.0:3123")?
    .run()
    .await
}
