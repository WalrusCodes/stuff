use actix::{
    Actor, ActorContext, ActorFuture, Addr, AsyncContext, ContextFutureSpawner, Handler,
    StreamHandler, WrapFuture,
};
use actix_web::{middleware, web, App, HttpRequest, HttpResponse, HttpServer, Responder};
use actix_web_actors::ws;
use serde::Deserialize;
use std::env;

mod db;
mod websockets;

use db::{dummy::DummyDatabase, Database};
// use ws::WsServer;

/// Request for adding a new item to a bin.
#[derive(Deserialize, Default, Clone, Debug)]
struct AddRequest {
    name: String,
}

/// Request for moving an item to a different bin or different location in the bin.
#[derive(Deserialize, Default, Clone, Debug)]
struct MoveRequest {
    bin_id: String,
    location: usize,
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
    let state = data.db.get_bins();
    HttpResponse::Ok().json(state)
}

/// Handler for POST "/bins/{bin_id}" - adds an item to a bin.
async fn add_item(
    data: web::Data<AppState>,
    web::Path(bin_id): web::Path<String>,
    req: web::Json<AddRequest>,
) -> impl Responder {
    HttpResponse::Ok().json(data.db.add_item(&bin_id, &req.name))
}

/// Handler for POST "/items/{item_id}/move".
async fn move_item(
    data: web::Data<AppState>,
    web::Path(item_id): web::Path<String>,
    req: web::Json<MoveRequest>,
) -> impl Responder {
    HttpResponse::Ok().json(data.db.move_item(&item_id, &req.bin_id, req.location))
}

struct WsSession {
    addr: Addr<websockets::WsServer>,
}

impl WsSession {
    /// Sends given message to the websockets actor, waits for response and checks that it
    /// succeeded.
    fn send_to_wsserver_and_wait<M>(&self, ctx: &mut <WsSession as Actor>::Context, msg: M)
    where
        M: 'static + actix::Message + Send,
        M::Result: Send,
        websockets::WsServer: Handler<M>,
    {
        self.addr
            .send(msg)
            .into_actor(self)
            .then(|res, _act, _ctx| {
                assert!(res.is_ok());
                actix::fut::ready(())
            })
            .wait(ctx);
    }
}

impl Actor for WsSession {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        log::info!("ws session started");
        self.addr.do_send(websockets::Connect {
            addr: ctx.address().recipient(),
        });
    }

    fn stopping(&mut self, ctx: &mut Self::Context) -> actix::Running {
        log::info!("ws session stopping");
        self.addr.do_send(websockets::Disconnect {
            addr: ctx.address().recipient(),
        });
        actix::Running::Stop
    }
}

impl Handler<websockets::BroadcastMessage> for WsSession {
    type Result = ();

    fn handle(
        &mut self,
        msg: websockets::BroadcastMessage,
        ctx: &mut Self::Context,
    ) -> Self::Result {
        // Send the message text.
        ctx.text(msg.msg);
    }
}

/// WebSocket message handler
impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for WsSession {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        log::info!("ws msg: {:?}", msg);
        match msg {
            Ok(ws::Message::Ping(msg)) => {
                ctx.pong(&msg);
            }
            Ok(ws::Message::Nop) => {}
            Ok(ws::Message::Pong(_)) => {}
            Ok(ws::Message::Text(_text)) => {}
            Ok(ws::Message::Binary(_bin)) => {}
            Ok(ws::Message::Close(reason)) => {
                ctx.close(reason);
                ctx.stop();
            }
            Ok(ws::Message::Continuation(_)) | Err(_) => {
                ctx.stop();
            }
        }
    }
}

async fn websocket_route(
    req: HttpRequest,
    stream: web::Payload,
    srv: web::Data<actix::Addr<websockets::WsServer>>,
) -> Result<HttpResponse, actix_web::Error> {
    log::info!("starting websocket stream");
    ws::start(
        WsSession {
            addr: srv.get_ref().clone(),
        },
        &req,
        stream,
    )
}

fn config_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/bins")
            .route("", web::get().to(get_bins))
            .route("/{bin_id}", web::post().to(add_item)),
    );
    cfg.service(web::scope("/items").route("/{item_id}/move", web::post().to(move_item)));
    // Websockets.
    cfg.service(web::resource("/ws").to(websocket_route));
    // 404 handler for any other paths.
    cfg.service(web::scope("").default_service(
        web::resource("").route(web::to(|| HttpResponse::NotFound().body("page not found"))),
    ));
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    if env::var_os("RUST_LOG").is_none() {
        env::set_var("RUST_LOG", "info,actix_web=debug,actix_server=debug");
    }
    env_logger::init();

    let state = web::Data::new(AppState::new());

    let server = websockets::WsServer::new().start();

    HttpServer::new(move || {
        App::new()
            .data(state.clone())
            .data(server.clone())
            .wrap(middleware::Logger::default())
            .configure(config_routes)
    })
    .bind("0.0.0.0:3123")?
    .run()
    .await
}
