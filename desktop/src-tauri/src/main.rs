#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;
use std::time::{Duration, Instant};
use tauri::{WindowEvent};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

// Jejak tombol Q kombo agar urutan Q lalu H (tahan Ctrl+Shift+Alt) terdeteksi.
struct ComboState(Mutex<Option<Instant>>);

fn main() {
    // Log diagnosis (release tanpa console): %TEMP%\elibrary-debug.log
    std::panic::set_hook(Box::new(|info| {
        let msg = format!("[PANIC] {}\n", info);
        let mut p = std::env::temp_dir();
        p.push("elibrary-debug.log");
        let _ = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(p)
            .and_then(|mut f| {
                use std::io::Write;
                f.write_all(msg.as_bytes())
            });
    }));

    let mods = Modifiers::CONTROL | Modifiers::SHIFT | Modifiers::ALT;
    let key_q = Shortcut::new(Some(mods), Code::KeyQ);
    let key_h = Shortcut::new(Some(mods), Code::KeyH);

    tauri::Builder::default()
        .manage(ComboState(Mutex::new(None)))
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
