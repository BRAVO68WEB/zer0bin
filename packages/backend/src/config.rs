#[derive(Clone)]
pub struct Config {
    pub server: ServerConfig,
    pub pastes: PastesConfig,
    pub ratelimits: RatelimitsConifg,
    pub databases: DatabasesConfig,
    pub logging: LoggingConfig
}

#[derive(Clone)]
pub struct ServerConfig {
    pub backend_host: String,
    pub backend_port: u16,
}

#[derive(Clone)]
pub struct RatelimitsConifg {
    pub seconds_in_between_pastes: u64,
    pub allowed_pastes_before_ratelimit: u32,
}

#[derive(Clone)]
pub struct PastesConfig {
    pub character_limit: usize,
    pub days_til_expiration: i64,
    pub id_length: usize,
}

#[derive(Clone)]
pub struct DatabasesConfig {
    pub postgres_uri: String, 
}

#[derive(Clone)]
pub struct LoggingConfig {
    pub on_post_paste: bool,
    pub on_get_paste: bool
}

fn env_var(key: &str) -> String {
    std::env::var(key).unwrap_or_else(|e| {
        eprintln!("Failed to read environment variable {}: {}", key, e);
        std::process::exit(1);
    })
}

fn env_var_parse<T: std::str::FromStr>(key: &str) -> T {
    let value = env_var(key);
    value.parse().unwrap_or_else(|_| {
        eprintln!("Failed to parse environment variable {}: invalid value", key);
        std::process::exit(1);
    })
}

pub fn load() -> Config {
    Config {
        server: ServerConfig {
            backend_host: env_var("BACKEND_HOST"),
            backend_port: env_var_parse("BACKEND_PORT"),
        },
        pastes: PastesConfig {
            character_limit: env_var_parse("CHARACTER_LIMIT"),
            days_til_expiration: env_var_parse("DAYS_TIL_EXPIRATION"),
            id_length: env_var_parse("ID_LENGTH"),
        },
        ratelimits: RatelimitsConifg {
            seconds_in_between_pastes: env_var_parse("SECONDS_IN_BETWEEN_PASTES"),
            allowed_pastes_before_ratelimit: env_var_parse("ALLOWED_PASTES_BEFORE_RATELIMIT"),
        },
        databases: DatabasesConfig {
            postgres_uri: env_var("POSTGRES_URI"),
        },
        logging: LoggingConfig {
            on_post_paste: env_var_parse("ON_POST_PASTE"),
            on_get_paste: env_var_parse("ON_GET_PASTE"),
        },
    }
}
