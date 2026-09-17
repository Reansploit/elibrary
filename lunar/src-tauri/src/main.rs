#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;

// Jalankan script PowerShell di PC target via WinRM.
// Syarat target: Enable-PSRemoting + user admin lokal. Proses anak disembunyikan.
#[tauri::command]
fn winrm_exec(host: String, user: String, pass: String, script: String) -> Result<String, String> {
    let wrap = format!(
        "$sec = ConvertTo-SecureString '{pass}' -AsPlainText -Force; \
         $cred = New-Object System.Management.Automation.PSCredential('{user}', $sec); \
         Invoke-Command -ComputerName '{host}' -Credential $cred \
         -Authentication Negotiate -ErrorAction Stop -ScriptBlock {{ {script} }}",
        pass = ps_quote(&pass),
        user = ps_quote(&user),
        host = ps_quote(&host),
        script = script
    );
    let mut cmd = Command::new("powershell.exe");
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000);
    }
    let out = cmd
        .args(["-NoProfile", "-NonInteractive", "-Command", &wrap])
        .output()
        .map_err(|e| format!("gagal jalan powershell: {}", e))?;
    if out.status.success() {
        Ok(String::from_utf8_lossy(&out.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&out.stderr).trim().to_string())
    }
}

// Bungkus string untuk literal kutip-satu PowerShell.
fn ps_quote(s: &str) -> String {
    s.replace('\'', "''")
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![winrm_exec])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
