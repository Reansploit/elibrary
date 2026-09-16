#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;
use std::time::{Duration, Instant};
use tauri::{Manager, WindowEvent};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

// Dipanggil splash (dist/index.html) sekali saat server disimpan:
// pasang agent.exe + agent.json + autostart + jalankan agen. Gagal = diam.
#[tauri::command]
fn setup_agent(app: tauri::AppHandle, panel_url: String) -> Result<(), String> {
    let resource = app
        .path()
        .resolve("agent-dist/agent.exe", tauri::path::BaseDirectory::Resource)
        .map_err(|e| e.to_string())?;
    let exe_dir = std::env::current_exe()
        .map_err(|e| e.to_string())?
        .parent()
        .ok_or("tanpa folder exe")?
        .to_path_buf();
    let dest = exe_dir.join("agent.exe");
    let need_copy = match (std::fs::read(&resource), std::fs::read(&dest)) {
        (Ok(a), Ok(b)) => a != b,
        _ => true,
    };
    if need_copy {
        std::fs::copy(&resource, &dest).map_err(|e| e.to_string())?;
    }
    let panel_url = panel_url.trim().trim_end_matches('/').to_string();
    let app_path = std::env::current_exe()
        .map_err(|e| e.to_string())?
        .to_string_lossy()
        .to_string();
    let conf_path = exe_dir.join("agent.json");
    if !conf_path.exists() {
        let conf = format!(
            "{{\n  \"panel_url\": \"{}\",\n  \"app_path\": \"{}\",\n  \"token\": \"\"\n}}\n",
            panel_url,
            app_path.replace('\\', "\\\\")
        );
        std::fs::write(&conf_path, conf).map_err(|e| e.to_string())?;
    }
    let _ = std::process::Command::new("reg")
        .args([
            "add",
            r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run",
            "/v",
            "ELibraryAgent",
            "/t",
            "REG_SZ",
            "/d",
            &dest.to_string_lossy().to_string(),
            "/f",
        ])
        .status();
    let _ = std::process::Command::new(&dest).spawn();
    Ok(())
}

// Jejak tombol Q kombo agar urutan Q lalu H (tahan Ctrl+Shift+Alt) terdeteksi.
struct ComboState(Mutex<Option<Instant>>);

fn main() {
    let mods = Modifiers::CONTROL | Modifiers::SHIFT | Modifiers::ALT;
    let key_q = Shortcut::new(Some(mods), Code::KeyQ);
    let key_h = Shortcut::new(Some(mods), Code::KeyH);

    tauri::Builder::default()
        .manage(ComboState(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![setup_agent])
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(move |app, shortcut, event| {
                    if event.state != ShortcutState::Pressed {
                        return;
                    }
                    let state = app.state::<ComboState>();
                    if shortcut == &key_q {
                        *state.0.lock().unwrap() = Some(Instant::now());
                    } else if shortcut == &key_h {
                        let armed = state
                            .0
                            .lock()
                            .unwrap()
                            .map(|t| t.elapsed() < Duration::from_secs(3))
                            .unwrap_or(false);
                        *state.0.lock().unwrap() = None;
                        if armed {
                            std::process::exit(0);
                        }
                    }
                })
                .build(),
        )
        .setup(|app| {
            let mods = Modifiers::CONTROL | Modifiers::SHIFT | Modifiers::ALT;
            app.global_shortcut()
                .register(Shortcut::new(Some(mods), Code::KeyQ))?;
            app.global_shortcut()
                .register(Shortcut::new(Some(mods), Code::KeyH))?;
            Ok(())
        })
        .on_window_event(|_window, event| {
            // Tolak semua permintaan tutup (tombol X, Alt+F4, taskbar).
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
