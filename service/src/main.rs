use service::controller;
use service::ctx::Ctx;
use std::env::current_dir;

fn main() {
    tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .unwrap()
        .block_on(http_main());
}

fn env() -> String {
    match std::env::var("PROFILE_NAME") {
        Ok(env) => env.to_lowercase(),
        Err(_) => "local".to_string(),
    }
}

fn read_env_with_parse<T: std::str::FromStr<Err = std::num::ParseIntError>>(v: &str) -> T {
    std::env::var(v)
        .expect(&format!("Expected env: <{v:?}>"))
        .parse::<T>()
        .expect(&format!("<{v:?}> cannot be parsed"))
}

fn read_env(v: &str) -> String {
    std::env::var(v).expect(&format!("Expected env: <{v:?}>"))
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

    let path = current_dir().unwrap();
    let settings = service::settings::Settings::new_with_file(
        path.join("etc/settings").as_path(),
        env().as_str(),
    )
    .unwrap();

    println!("settings: {:?}", settings);

    let pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(5)
        .connect(&read_env("DATABASE_URL"))
        .await
        .expect("could not connect to the database");

    let categories = controller::category::categories(&pool)
        .await
        .expect("not able to the categories");

    let socket_address: std::net::SocketAddr =
        (std::net::Ipv4Addr::UNSPECIFIED, read_env_with_parse("PORT")).into();
    println!(
        "#### Started at: {}:{} ####",
        socket_address.ip(),
        socket_address.port()
    );
    let listener = tokio::net::TcpListener::bind(socket_address)
        .await
        .expect("cannot bind the address");

    let ctx = Ctx {
        db: pool,
        category_map: std::sync::Arc::new(std::sync::RwLock::new(categories)),
    };

    // let cloned_ctx = ctx.clone();
    // tokio::task::spawn(async move {
    //     controller::category::refresh_categories(cloned_ctx).await;
    // });

    // println!("categories: {:?}", categories);

    let app = service::routes::routes(ctx).await;

    axum::serve(listener, app.into_make_service())
        .await
        .unwrap()
}
