pub mod api;
pub mod controller;
pub mod errors;
pub mod router;

fn env() -> String {
    match std::env::var("ENV") {
        Ok(env) => env.to_lowercase(),
        Err(_) => "local".to_string(),
    }
}

fn port() -> u16 {
    std::env::var("PORT")
        .expect("Expected <PORT>")
        .parse::<u16>()
        .expect("<PORT> cannot be parsed")
}

pub async fn http_main() {
    // Setting the environment variables
    use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "example_customize_extractor_error=trace".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let env_path = format!("{}.env", env());
    println!("Environment file path: {}", env_path);
    dotenv::from_path(env_path.as_str()).ok();

    let pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(5)
        .connect("postgres://wilderbit:@localhost/postgres")
        .await
        .expect("could not connect to the database");

    let socket_address: std::net::SocketAddr = (std::net::Ipv4Addr::UNSPECIFIED, port()).into();
    println!(
        "#### Started at: {}:{} ####",
        socket_address.ip(),
        socket_address.port()
    );
    let listener = tokio::net::TcpListener::bind(socket_address).await.expect("cannot bind the server");
    let app = router::routes(pool).await;
    axum::serve(listener, app.into_make_service())
        .await
        .unwrap()
}
