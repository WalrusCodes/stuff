//! WebSocket server

use std::collections::HashSet;

use actix::{Actor, Context, Handler, Recipient};

pub type SessionId = Recipient<BroadcastMessage>;

#[derive(actix::Message, Debug)]
#[rtype(result = "()")]
pub struct Connect {
    pub addr: Recipient<BroadcastMessage>,
}

#[derive(actix::Message, Debug)]
#[rtype(result = "()")]
pub struct Disconnect {
    pub addr: Recipient<BroadcastMessage>,
}

#[derive(actix::Message, Clone)]
#[rtype(result = "()")]
pub struct BroadcastMessage {
    pub msg: String,
}

pub struct WsServer {
    sessions: HashSet<SessionId>,
}

impl WsServer {
    pub fn new() -> Self {
        WsServer {
            sessions: HashSet::new(),
        }
    }

    pub fn send_client_status_to_all(&mut self) {
        let msg = BroadcastMessage {
            msg: format!(r#"{{ "ws": {{ "clients": {} }} }}"#, self.sessions.len()),
        };
        for recipient in self.sessions.iter() {
            if let Err(x) = recipient.do_send(msg.clone()) {
                log::warn!("do_send failed: {}", x);
            }
        }
    }

    pub fn add_session(&mut self, id: SessionId) {
        assert!(self.sessions.insert(id));
        self.send_client_status_to_all();
    }

    pub fn remove_session(&mut self, id: &SessionId) {
        assert!(self.sessions.remove(id));
        self.send_client_status_to_all();
    }
}

impl Actor for WsServer {
    type Context = Context<Self>;
}

impl Handler<Connect> for WsServer {
    type Result = ();

    fn handle(&mut self, msg: Connect, _ctx: &mut Self::Context) -> Self::Result {
        log::info!("Connect: {:?}", msg);
        self.add_session(msg.addr);
    }
}

impl Handler<Disconnect> for WsServer {
    type Result = ();

    fn handle(&mut self, msg: Disconnect, _ctx: &mut Self::Context) -> Self::Result {
        log::info!("Disconnect: {:?}", msg);
        self.remove_session(&msg.addr);
    }
}
