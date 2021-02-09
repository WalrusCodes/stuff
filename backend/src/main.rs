use actix_web::{middleware, web, App, HttpResponse, HttpServer, Responder};
use serde::Serialize;
use std::env;

#[derive(Serialize)]
struct Bin {
    name: String,
    id: String,
}

#[derive(Serialize)]
struct BinList {
    bins: Vec<Bin>,
}

/// Handler for "/list" - returns a list of bins.
async fn handle_list() -> impl Responder {
    let mut bin_list = vec![];
    for i in 1..=3 {
        bin_list.push(Bin {
            name: i.to_string(),
            id: format!("bin-{}", i),
        });
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
