//! Agen Panel Perpus — service ringan untuk PC perpustakaan.
//!
//! - Enroll otomatis (MAC + hostname) saat pertama jalan.
//! - Heartbeat tiap 30 detik: app buka/tutup, judul window aktif.
//! - Eksekusi perintah remote: open_app / close_app / restart_agent.
//! - Autostart via Registry Run (ditulis otomatis saat pertama jalan).
//!
//! Murni Rust std + tool bawaan Windows (getmac, tasklist, taskkill,
//! powershell, reg) — tanpa runtime tambahan.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::io::Write;
use std::os::windows::process::CommandExt;
use std::path::PathBuf;
use std::process::Command;
use std::thread;
use std::time::Duration;

const HEARTBEAT_SECS: u64 = 30;
const AGENT_VERSION: &str = "0.1.0";
// Anak proses tanpa jendela (tanpa ini tiap denyut nongol terminal).
const NO_WINDOW: u32 = 0x08000000;

fn silent_cmd(cmd: &str) -> Command {
    let mut c = Command::new(cmd);
    c.creation_flags(NO_WINDOW);
    c
}

#[derive(Debug)]
struct Config {
    panel_url: String,
    app_path: String,
    token: Option<String>,
}

fn exe_dir() -> PathBuf {
    std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|d| d.to_path_buf()))
        .unwrap_or_else(|| PathBuf::from("."))
}

fn config_path() -> PathBuf {
    exe_dir().join("agent.json")
}

fn log_path() -> PathBuf {
    exe_dir().join("agent.log")
}

fn log(msg: &str) {
    let line = format!(
        "[{}] {}\n",
        chrono_now(),
        msg.replace('\n', " ")
    );
    let _ = fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(log_path())
        .and_then(|mut f| f.write_all(line.as_bytes()));
    println!("{}", line.trim_end());
}

// Tanggal-jam lokal sederhana tanpa crate tambahan.
fn chrono_now() -> String {
    let out = silent_cmd("powershell")
        .args([
            "-NoProfile",
            "-Command",
            "Get-Date -Format 'yyyy-MM-dd HH:mm:ss'",
        ])
        .output();
    match out {
        Ok(o) => String::from_utf8_lossy(&o.stdout).trim().to_string(),
        Err(_) => "?".to_string(),
    }
}

fn default_config() -> Config {
    let guess_app = exe_dir().join("elibrary-desktop.exe");
    Config {
        panel_url: "http://192.168.2.51:3003".to_string(),
        app_path: guess_app.to_string_lossy().to_string(),
        token: None,
    }
}

fn load_config() -> Config {
    let path = config_path();
    let mut cfg = default_config();
    let Ok(text) = fs::read_to_string(&path) else {
        save_config(&cfg);
        log(&format!("config baru dibuat: {}", path.display()));
        return cfg;
    };
    for line in text.lines() {
        let line = line.trim().trim_matches(|c| c == ',' || c == '{' || c == '}');
        let mut kv = line.splitn(2, ':');
        let (Some(k), Some(v)) = (kv.next(), kv.next()) else {
            continue;
        };
        // Nilai app_path mengandung ':' (C:\...), jadi potong dari kanan:
        // kunci di kiri ':' pertama, nilai = sisa setelahnya tanpa koma akhir.
        let k = k.trim().trim_matches('"');
        let mut v = v.trim();
        if let Some(stripped) = v.strip_suffix(',') {
            v = stripped;
        }
        let v = v.trim().trim_matches('"').replace("\\\\", "\\");
        match k {
            "panel_url" => cfg.panel_url = v.trim_end_matches('/').to_string(),
            "app_path" => cfg.app_path = expand_env(&v),
            "token" => {
                if !v.is_empty() {
                    cfg.token = Some(v.to_string());
                }
            }
            _ => {}
        }
    }
    cfg
}

// Kembangkan %NAMA% ala Windows (mis. %LOCALAPPDATA%).
fn expand_env(value: &str) -> String {
    let mut out = String::new();
    let mut rest = value;
    while let Some(start) = rest.find('%') {
        out.push_str(&rest[..start]);
        rest = &rest[start + 1..];
        match rest.find('%') {
            Some(end) => {
                let name = &rest[..end];
                out.push_str(
                    &std::env::var(name).unwrap_or_else(|_| format!("%{}%", name)),
                );
                rest = &rest[end + 1..];
            }
            None => {
                out.push('%');
                break;
            }
        }
    }
    out.push_str(rest);
    out
}

fn save_config(cfg: &Config) -> bool {
    let text = format!(
        "{{\n  \"panel_url\": \"{}\",\n  \"app_path\": \"{}\",\n  \"token\": \"{}\"\n}}\n",
        cfg.panel_url,
        cfg.app_path.replace('\\', "\\\\"),
        cfg.token.clone().unwrap_or_default()
    );
    match fs::write(config_path(), &text) {
        Ok(()) => true,
        Err(e) => {
            log(&format!(
                "GAGAL tulis config ({}). Tutup agen, klik kanan agent.exe > Run as administrator sekali, lalu jalankan biasa.",
                e
            ));
            false
        }
    }
}

fn run(cmd: &str, args: &[&str]) -> String {
    silent_cmd(cmd)
        .args(args)
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).to_string())
        .unwrap_or_default()
}

fn mac_address() -> String {
    // Baris CSV getmac: "Nama","Transport Name","Alamat Fisik",...
    for line in run("getmac", &["/fo", "csv", "/nh"]).lines() {
        let cells: Vec<&str> = line.split("\",\"").collect();
        for cell in cells {
            let c = cell.trim().trim_matches('"').to_uppercase();
            if c.len() == 17 && c.chars().filter(|x| *x == '-').count() == 5 {
                return c.replace('-', ":");
            }
        }
    }
    "00:00:00:00:00:00".to_string()
}

fn hostname() -> String {
    std::env::var("COMPUTERNAME").unwrap_or_else(|_| "PC-TANPA-NAMA".to_string())
}

fn app_running() -> bool {
    run("tasklist", &["/fi", "IMAGENAME eq elibrary-desktop.exe", "/fo", "csv", "/nh"])
        .to_lowercase()
        .contains("elibrary-desktop.exe")
}

fn active_title() -> Option<String> {
    let ps = r#"Add-Type @"using System;using System.Runtime.InteropServices;using System.Text;public class W{[DllImport("user32.dll")]public static extern IntPtr GetForegroundWindow();[DllImport("user32.dll")]public static extern int GetWindowText(IntPtr h,StringBuilder t,int n);}"@; $h=[W]::GetForegroundWindow(); $s=New-Object Text.StringBuilder 256; [W]::GetWindowText($h,$s,256)|Out-Null; $s.ToString()"#;
    let title = run("powershell", &["-NoProfile", "-Command", ps]);
    let title = title.trim().to_string();
    if title.is_empty() {
        None
    } else {
        Some(title.chars().take(200).collect())
    }
}

fn ensure_autostart() {
    let exe = std::env::current_exe()
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_default();
    if exe.is_empty() {
        return;
    }
    let current = run(
        "reg",
        &[
            "query",
            r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run",
            "/v",
            "ELibraryAgent",
        ],
    );
    if current.contains("ELibraryAgent") {
        return;
    }
    let status = silent_cmd("reg")
        .args([
            "add",
            r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run",
            "/v",
            "ELibraryAgent",
            "/t",
            "REG_SZ",
            "/d",
            &exe,
            "/f",
        ])
        .status();
    match status {
        Ok(s) if s.success() => log("autostart terpasang (Registry Run)"),
        _ => log("GAGAL pasang autostart"),
    }
}

fn post_json(url: &str, token: Option<&str>, body: &str) -> Option<String> {
    let mut cmd = silent_cmd("curl.exe");
    cmd.args(["-s", "-m", "20", "-X", "POST", url]);
    cmd.args(["-H", "Content-Type: application/json"]);
    cmd.args(["-H", "Accept: application/json"]);
    if let Some(t) = token {
        cmd.args(["-H", &format!("Authorization: Bearer {}", t)]);
    }
    cmd.args(["-d", body]);
    match cmd.output() {
        Ok(o) if o.status.success() => Some(String::from_utf8_lossy(&o.stdout).to_string()),
        _ => None,
    }
}

fn json_get<'a>(body: &'a str, key: &str) -> Option<String> {
    // Ambil nilai string sederhana "key":"value" dari JSON datar.
    let needle = format!("\"{}\":\"", key);
    let start = body.find(&needle)? + needle.len();
    let end = body[start..].find('"')? + start;
    Some(body[start..end].to_string())
}

fn enroll(cfg: &mut Config) -> bool {
    let body = format!(
        "{{\"mac\":\"{}\",\"hostname\":\"{}\",\"agent_version\":\"{}\"}}",
        mac_address(),
        hostname().replace('"', ""),
        AGENT_VERSION
    );
    let url = format!("{}/api/v1/enroll", cfg.panel_url);
    match post_json(&url, None, &body).and_then(|r| json_get(&r, "token")) {
        Some(token) => {
            cfg.token = Some(token);
            if save_config(cfg) {
                log("enroll OK, token tersimpan");
            }
            true
        }
        None => {
            log("enroll GAGAL (panel tidak terjangkau?)");
            false
        }
    }
}

fn heartbeat(cfg: &Config) -> bool {
    let token = match &cfg.token {
        Some(t) => t.clone(),
        None => return false,
    };
    let open = app_running();
    let title = active_title().unwrap_or_default().replace('"', "");
    let body = format!(
        "{{\"mac\":\"{}\",\"app_open\":{},\"active_title\":\"{}\",\"agent_version\":\"{}\"}}",
        mac_address(),
        if open { "true" } else { "false" },
        title,
        AGENT_VERSION
    );
    let url = format!("{}/api/v1/heartbeat", cfg.panel_url);
    let resp = match post_json(&url, Some(&token), &body) {
        Some(r) => r,
        None => {
            log("heartbeat GAGAL (panel tidak terjangkau?)");
            return false;
        }
    };

    // Ambil perintah: {"commands":[{"id":1,"action":"open_app"}]}
    let mut rest = resp.as_str();
    while let Some(pos) = rest.find("\"id\":") {
        rest = &rest[pos + 5..];
        let id: String = rest.chars().take_while(|c| c.is_ascii_digit()).collect();
        let action = rest
            .find("\"action\":\"")
            .map(|p| {
                let s = &rest[p + 10..];
                s[..s.find('"').unwrap_or(0)].to_string()
            })
            .unwrap_or_default();
        if id.is_empty() || action.is_empty() {
            break;
        }
        execute_command(cfg, &token, &id, &action);
    }
    true
}

fn execute_command(cfg: &Config, token: &str, id: &str, action: &str) {
    log(&format!("perintah {}: {}", id, action));
    let ok = match action {
        "open_app" => Command::new(&cfg.app_path).spawn().is_ok(),
        "close_app" => silent_cmd("taskkill")
            .args(["/F", "/IM", "elibrary-desktop.exe"])
            .status()
            .map(|s| s.success())
            .unwrap_or(false),
        "restart_agent" => {
            // Ack DULU baru keluar, kalau tidak perintah ini diulang terus.
            let url = format!("{}/api/v1/commands/{}/ack", cfg.panel_url, id);
            let mac = mac_address();
            let body = format!("{{\"mac\":\"{}\",\"status\":\"done\"}}", mac);
            let _ = post_json(&url, Some(token), &body);
            log(&format!("perintah {} selesai: restart", id));
            if let Some(path) = std::env::current_exe()
                .ok()
                .map(|p| p.to_string_lossy().to_string())
            {
                let _ = Command::new(&path).spawn();
            }
            std::process::exit(0);
        }
        _ => false,
    };
    let url = format!("{}/api/v1/commands/{}/ack", cfg.panel_url, id);
    let mac = mac_address();
    let body = format!(
        "{{\"mac\":\"{}\",\"status\":\"{}\"}}",
        mac,
        if ok { "done" } else { "failed" }
    );
    let _ = post_json(&url, Some(token), &body);
    log(&format!("perintah {} selesai: {}", id, ok));
}

fn main() {
    log("=== agen mulai ===");
    let mut cfg = load_config();
    log(&format!("panel: {}", cfg.panel_url));
    log(&format!("app: {}", cfg.app_path));
    log(&format!("mac: {} host: {}", mac_address(), hostname()));
    ensure_autostart();

    if cfg.token.is_none() && !enroll(&mut cfg) {
        log("menunggu panel... coba lagi 60 detik");
        thread::sleep(Duration::from_secs(60));
        if !enroll(&mut cfg) {
            log("tetap gagal, keluar. Jalankan lagi setelah panel siap.");
            return;
        }
    }

    loop {
        if !heartbeat(&cfg) {
            // Token mungkin di-rotate; enroll ulang sekali.
            let mut retry = cfg.token.is_none();
            if !retry {
                // Coba enroll ulang untuk dapat token baru.
                retry = enroll(&mut cfg);
            }
            if retry {
                heartbeat(&cfg);
            }
        }
        thread::sleep(Duration::from_secs(HEARTBEAT_SECS));
    }
}
