use config::File;

#[derive(Debug, serde::Deserialize)]
pub struct Settings {
    pub service: ServiceSettings,
}

#[derive(Debug, serde::Deserialize)]
pub struct ServiceSettings {
    pub environment: String,
}

impl Settings {
    pub fn new_with_file(
        path: &std::path::Path,
        profile: &str,
    ) -> Result<Self, config::ConfigError> {
        let settings_file_path = path.join(format!("settings-{}.toml", profile));
        let default_settings_path = path.join("default.toml");

        let settings = config::Config::builder()
            .add_source(File::from(default_settings_path))
            .add_source(File::from(settings_file_path))
            .build()?;
        settings.try_deserialize()
    }
}
