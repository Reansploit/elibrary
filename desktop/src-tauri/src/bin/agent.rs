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

const HEARTBEAT_SECS: u64 = 10;
const AGENT_VERSION: &str = "0.3.0";
// Anak proses tanpa jendela (tanpa ini tiap denyut nongol terminal).
const NO_WINDOW: u32 = 0x08000000;

// Status app yang diinginkan panel (false = jangan hidupkan lagi).
static APP_EXPECTED: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(true);
// Berapa denyut beruntun window asing di depan.
static FOREIGN_STREAK: std::sync::atomic::AtomicU32 = std::sync::atomic::AtomicU32::new(0);

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
    exe_dir().join("wbshelper.json")
}

fn log_path() -> PathBuf {
    exe_dir().join("wbshelper.log")
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
                "GAGAL tulis config ({}). Tutup agen, klik kanan WBSHelper.exe > Run as administrator sekali, lalu jalankan biasa.",
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
    // Add-Type satu baris (tanpa here-string) + fallback proses GUI terbaru.
    let ps = "Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; using System.Text; public class FG { [DllImport(\"user32.dll\")] public static extern IntPtr GetForegroundWindow(); [DllImport(\"user32.dll\")] public static extern int GetWindowText(IntPtr h, StringBuilder t, int n); }'; $h=[FG]::GetForegroundWindow(); $s=New-Object Text.StringBuilder 256; [FG]::GetWindowText($h,$s,256)|Out-Null; $s.ToString()";
    let title = run("powershell", &["-NoProfile", "-Command", ps]);
    let title = title.trim().to_string();
    if !title.is_empty() {
        return Some(title.chars().take(200).collect());
    }
    let fb = run(
        "powershell",
        &[
            "-NoProfile",
            "-Command",
            "Get-Process | Where-Object { $_.MainWindowTitle } | Sort-Object StartTime -Descending | Select-Object -First 1 -ExpandProperty MainWindowTitle",
        ],
    );
    let fb = fb.trim().to_string();
    if fb.is_empty() {
        None
    } else {
        Some(fb.chars().take(200).collect())
    }
}

// Daftar judul window yang terbuka (maks 25) untuk panel.
fn open_apps() -> Vec<String> {
    let out = run(
        "powershell",
        &[
            "-NoProfile",
            "-Command",
            "Get-Process | Where-Object { $_.MainWindowTitle } | Select-Object -ExpandProperty MainWindowTitle",
        ],
    );
    let mut seen = std::collections::HashSet::new();
    out.lines()
        .map(|l| l.trim().chars().take(200).collect::<String>())
        .filter(|t| !t.is_empty() && seen.insert(t.clone()))
        .take(25)
        .collect()
}

fn json_escape(s: &str) -> String {
    s.replace('\\', "\\\\").replace('"', "\\\"")
}

// Ambil string "kunci":"nilai" pertama dari potongan JSON.
fn json_field(chunk: &str, key: &str) -> String {
    let needle = format!("\"{}\":\"", key);
    chunk
        .find(&needle)
        .map(|p| {
            let s = &chunk[p + needle.len()..];
            s[..s.find('"').unwrap_or(0)].to_string()
        })
        .unwrap_or_default()
}

// Daftar aplikasi kelolaan: [(exe, launch, reopen)].
fn parse_managed(resp: &str) -> Vec<(String, String, bool)> {
    let mut out = Vec::new();
    let Some(start) = resp.find("\"managed\":[") else {
        return out;
    };
    let mut rest = &resp[start + 11..];
    // Berhenti di akhir array (tanda ] sebelum "update").
    let end = rest.find("],\"update\"").or_else(|| rest.find(']')).unwrap_or(rest.len());
    rest = &rest[..end];
    for obj in rest.split("{").skip(1) {
        let body = match obj.find('}') {
            Some(p) => &obj[..p],
            None => continue,
        };
        let exe = json_field(body, "exe").to_lowercase();
        let launch = json_field(body, "launch");
        let reopen = body.contains("\"reopen\":true");
        if !exe.is_empty() && !launch.is_empty() {
            out.push((exe, launch, reopen));
        }
    }
    out
}

fn proc_running(exe: &str) -> bool {
    run(
        "tasklist",
        &["/fi", &format!("IMAGENAME eq {}", exe), "/fo", "csv", "/nh"],
    )
    .to_lowercase()
    .contains(&exe.to_lowercase())
}
fn is_newer(remote: &str, local: &str) -> bool {
    let parse = |v: &str| {
        v.split('.')
            .map(|p| p.chars().take_while(|c| c.is_ascii_digit()).collect::<String>())
            .map(|p| p.parse::<u32>().unwrap_or(0))
            .collect::<Vec<_>>()
    };
    let (a, b) = (parse(remote), parse(local));
    for i in 0..a.len().max(b.len()) {
        let (x, y) = (*a.get(i).unwrap_or(&0), *b.get(i).unwrap_or(&0));
        if x != y {
            return x > y;
        }
    }
    false
}

// Cek manual ke manifest rilis (dipakai perintah update_agent).
fn check_update_now(cfg: &Config) -> bool {
    let url = format!("{}/rilis/manifest.json", cfg.panel_url);
    let out = silent_cmd("curl.exe")
        .args(["-s", "-m", "20", &url])
        .output();
    let body = match out {
        Ok(o) if o.status.success() => String::from_utf8_lossy(&o.stdout).to_string(),
        _ => return false,
    };
    let ver = body
        .find("\"agent_version\":\"")
        .map(|p| {
            let s = &body[p + 17..];
            s[..s.find('"').unwrap_or(0)].to_string()
        })
        .unwrap_or_default();
    let file = body
        .find("\"agent_file\":\"")
        .map(|p| {
            let s = &body[p + 14..];
            s[..s.find('"').unwrap_or(0)].to_string()
        })
        .unwrap_or_default();
    if ver.is_empty() || file.is_empty() || !is_newer(&ver, AGENT_VERSION) {
        log("agen sudah versi terbaru");
        return true;
    }
    let dl = format!("{}/rilis/{}", cfg.panel_url, file);
    self_update(&dl, &ver);
    true
}

// Update diri: unduh exe baru, tukar saat keluar, jalan lagi.
fn self_update(url: &str, version: &str) {
    log(&format!("update agen tersedia: v{}", version));
    let exe = match std::env::current_exe() {
        Ok(p) => p,
        Err(_) => return,
    };
    let dir = match exe.parent() {
        Some(d) => d.to_path_buf(),
        None => return,
    };
    let fresh = dir.join("WBSHelper.new");
    let dl = silent_cmd("curl.exe")
        .args(["-s", "-m", "120", "-L", "-o"])
        .arg(&fresh)
        .arg(url)
        .status();
    let size = std::fs::metadata(&fresh).map(|m| m.len()).unwrap_or(0);
    if !dl.map(|s| s.success()).unwrap_or(false) || size < 100_000 {
        log("update GAGAL diunduh");
        let _ = std::fs::remove_file(&fresh);
        return;
    }
    // Batch penukar: tunggu mati, timpa, jalankan lagi, hapus diri.
    let bat = dir.join("wbsupdate.bat");
    let script = format!(
        "@echo off\r\ntimeout /t 3 /nobreak >nul\r\nmove /y \"{}\" \"{}\" >nul\r\ndel \"{}\" >nul\r\nstart \"\" \"{}\"\r\ndel \"%~f0\"\r\n",
        fresh.display(),
        exe.display(),
        fresh.display(),
        exe.display()
    );
    if std::fs::write(&bat, script).is_err() {
        return;
    }
    log("update terunduh, restart untuk pasang");
    let _ = silent_cmd("cmd").args(["/c", &bat.display().to_string()]).spawn();
    std::process::exit(0);
}

fn ensure_autostart() {
    // Bersihkan sisa nama lama bila ada.
    let _ = silent_cmd("reg")
        .args([
            "delete",
            r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run",
            "/v",
            "ELibraryAgent",
            "/f",
        ])
        .status();
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
            "WBSHelper",
        ],
    );
    if current.contains("WBSHelper") {
        return;
    }
    let status = silent_cmd("reg")
        .args([
            "add",
            r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run",
            "/v",
            "WBSHelper",
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
    let title = json_escape(&active_title().unwrap_or_default());
    let apps = open_apps()
        .iter()
        .map(|t| format!("\"{}\"", json_escape(t)))
        .collect::<Vec<_>>()
        .join(",");
    let body = format!(
        "{{\"mac\":\"{}\",\"app_open\":{},\"active_title\":\"{}\",\"apps\":[{}],\"agent_version\":\"{}\"}}",
        mac_address(),
        if open { "true" } else { "false" },
        title,
        apps,
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

    // Status yang diinginkan panel + update diri.
    if let Some(pos) = resp.find("\"app_expected\":") {
        let v = resp[pos + 15..].trim_start();
        APP_EXPECTED.store(
            v.starts_with("true"),
            std::sync::atomic::Ordering::SeqCst,
        );
    }

    if let Some(pos) = resp.find("\"update\":") {
        let chunk = &resp[pos..];
        let ver = chunk
            .find("\"agent_version\":\"")
            .map(|p| {
                let s = &chunk[p + 17..];
                s[..s.find('"').unwrap_or(0)].to_string()
            })
            .unwrap_or_default();
        let url = chunk
            .find("\"agent_url\":\"")
            .map(|p| {
                let s = &chunk[p + 13..];
                s[..s.find('"').unwrap_or(0)].to_string()
            })
            .unwrap_or_default();
        if !ver.is_empty() && !url.is_empty() && is_newer(&ver, AGENT_VERSION) {
            self_update(&url, &ver);
        }
    }

    // Rebut fokus: window asing di depan 3 denyut beruntun → kembalikan app.
    let expected = APP_EXPECTED.load(std::sync::atomic::Ordering::SeqCst);
    let mine = title.contains("E-Library");
    if expected && open && !title.is_empty() && !mine {
        let n = FOREIGN_STREAK.fetch_add(1, std::sync::atomic::Ordering::SeqCst) + 1;
        if n >= 3 {
            log(&format!("window asing dibiarkan, fokus direbut: {}", title));
            focus_app();
            FOREIGN_STREAK.store(0, std::sync::atomic::Ordering::SeqCst);
        }
    } else {
        FOREIGN_STREAK.store(0, std::sync::atomic::Ordering::SeqCst);
    }

    // Tegakkan daftar kelolaan: yang dicentang buka-otomatis dan mati → hidupkan.
    for (exe, launch, reopen) in parse_managed(&resp) {
        if reopen && !proc_running(&exe) {
            log(&format!("{} mati, dihidupkan lagi (kelolaan)", exe));
            let _ = Command::new(&launch).spawn();
        }
    }

    // Ambil perintah: {"commands":[{"id":1,"action":"open_app","target":{...}}]}
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
        // Target opsional: {"exe":"...","launch":"..."} atau null.
        let target = rest.find("\"target\":{").map(|p| {
            let s = &rest[p + 10..];
            let s = &s[..s.find('}').unwrap_or(0)];
            (json_field(s, "exe"), json_field(s, "launch"))
        });
        execute_command(cfg, &token, &id, &action, target);
    }
    true
}

fn execute_command(
    cfg: &Config,
    token: &str,
    id: &str,
    action: &str,
    target: Option<(String, String)>,
) {
    log(&format!("perintah {}: {}", id, action));
    let ok = match action {
        "open_app" => match &target {
            Some((_, launch)) if !launch.is_empty() => Command::new(launch).spawn().is_ok(),
            _ => Command::new(&cfg.app_path).spawn().is_ok(),
        },
        "close_app" => match &target {
            Some((exe, _)) if !exe.is_empty() => silent_cmd("taskkill")
                .args(["/F", "/IM", exe])
                .status()
                .map(|s| s.success())
                .unwrap_or(false),
            _ => silent_cmd("taskkill")
                .args(["/F", "/IM", "elibrary-desktop.exe"])
                .status()
                .map(|s| s.success())
                .unwrap_or(false),
        },
        "update_agent" => {
            // Ack dulu agar tidak diulang, lalu cek + pasang (keluar bila update).
            let url = format!("{}/api/v1/commands/{}/ack", cfg.panel_url, id);
            let mac = mac_address();
            let body = format!("{{\"mac\":\"{}\",\"status\":\"done\"}}", mac);
            let _ = post_json(&url, Some(token), &body);
            log(&format!("perintah {} selesai: cek update", id));
            check_update_now(cfg);
            true
        }
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
// Paksa window app kembali ke depan (lawan Alt+Tab).
fn focus_app() {
    let ps = "$w=New-Object -ComObject WScript.Shell; $w.AppActivate('E-Library')";
    let _ = silent_cmd("powershell").args(["-NoProfile", "-Command", ps]).output();
}

// Watchdog dua arah: app mati diam-diam (kill/task manager/hotkey)
// dihidupkan lagi — kecuali panel memang memintanya tertutup.
        let expected = APP_EXPECTED.load(std::sync::atomic::Ordering::SeqCst);
        if expected && !app_running() {
            log("app mati diam-diam, dihidupkan lagi");
            let _ = Command::new(&cfg.app_path).spawn();
        }
        thread::sleep(Duration::from_secs(HEARTBEAT_SECS));
    }
}
