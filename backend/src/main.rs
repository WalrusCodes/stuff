use actix_web::{middleware, web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};
use std::env;

mod db;

use db::{dummy::DummyDatabase, Database, Node};

/// Response for "/bins".
#[derive(Serialize, Clone)]
struct BinList {
    bins: Vec<Node>,
}

/// Request for adding a new item to a bin.
#[derive(Deserialize, Default, Clone, Debug)]
struct AddRequest {
    name: String,
}

struct AppState {
    db: DummyDatabase,
}

impl AppState {
    fn new() -> AppState {
        AppState {
            db: DummyDatabase::new(),
        }
    }
}

/// Handler for GET "/bins" - returns a list of bins containing items.
async fn get_bins(data: web::Data<AppState>) -> impl Responder {
    let bin_list = BinList {
        bins: data.db.get_bins(),
    };
    HttpResponse::Ok().json(bin_list)
}

/// Handler for POST "/bins/{bin_id}" - adds an item to a bin.
async fn add_item(
    data: web::Data<AppState>,
    web::Path(bin_id): web::Path<String>,
    req: web::Json<AddRequest>,
) -> impl Responder {
    HttpResponse::Ok().json(data.db.add_item(&bin_id, &req.name))
}

fn config_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/bins")
            .route("", web::get().to(get_bins))
            .route("/{bin_id}", web::post().to(add_item)),
    );
    cfg.service(web::scope("").default_service(
        web::resource("").route(web::to(|| HttpResponse::NotFound().body("nope"))),
    ));
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    if env::var_os("RUST_LOG").is_none() {
        env::set_var("RUST_LOG", "info,actix_web=debug,actix_server=debug");
    }
    env_logger::init();

    let state = web::Data::new(AppState::new());

    HttpServer::new(move || {
        App::new()
            .app_data(state.clone())
            .wrap(middleware::Logger::default())
            .configure(config_routes)
    })
    .bind("0.0.0.0:3123")?
    .run()
    .await
}
