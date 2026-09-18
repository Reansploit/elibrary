"""LunarAgent — agen Panel Perpus versi Python.

Service ringan untuk PC client: enroll otomatis, heartbeat, perintah
remote, watchdog dua arah, update diri. Tanpa jendela (dibangun dengan
--noconsole). Hanya stdlib, tanpa dependensi pihak ketiga.
"""

import ctypes
import json
import os
import socket
import subprocess
import sys
import time
import urllib.request
import uuid

AGENT_VERSION = "0.4.0"
HEARTBEAT_SECS = 10

_NO_WINDOW = 0x08000000


def exe_dir():
    return os.path.dirname(os.path.abspath(sys.argv[0]))


def log(msg):
    line = "[{}] {}".format(
        time.strftime("%Y-%m-%d %H:%M:%S"), str(msg).replace("\n", " ")
    )
    try:
        with open(os.path.join(exe_dir(), "lunaragent.log"), "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except OSError:
        pass


def config_path():
    return os.path.join(exe_dir(), "lunaragent.json")


def default_config():
    return {
        "panel_url": "http://192.168.2.51:3003",
        "app_path": os.path.join(exe_dir(), "elibrary-desktop.exe"),
        "token": "",
    }


def load_config():
    cfg = default_config()
    try:
        with open(config_path(), encoding="utf-8") as f:
            data = json.load(f)
    except (OSError, ValueError):
        save_config(cfg)
        log("config baru dibuat: {}".format(config_path()))
        return cfg
    for key in ("panel_url", "app_path", "token"):
        if data.get(key):
            cfg[key] = data[key]
    cfg["panel_url"] = cfg["panel_url"].rstrip("/")
    return cfg


def save_config(cfg):
    try:
        with open(config_path(), "w", encoding="utf-8") as f:
            json.dump(cfg, f, indent=2)
        return True
    except OSError as e:
        log("GAGAL tulis config ({}). Jalankan sekali sebagai Administrator.".format(e))
        return False


def run_hidden(args):
    """Jalankan proses tanpa jendela, kembalikan stdout teks."""
    try:
        out = subprocess.run(
            args,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            creationflags=_NO_WINDOW,
            timeout=30,
        )
        return out.stdout.decode("utf-8", "replace")
    except (OSError, subprocess.TimeoutExpired):
        return ""


def mac_address():
    node = uuid.getnode()
    mac = ":".join("{:02X}".format((node >> (8 * i)) & 0xFF) for i in reversed(range(6)))
    return mac


def hostname():
    return os.environ.get("COMPUTERNAME", socket.gethostname())


def proc_running(exe):
    out = run_hidden(["tasklist", "/fi", "IMAGENAME eq {}".format(exe), "/fo", "csv", "/nh"])
    return exe.lower() in out.lower()


def app_running():
    return proc_running("elibrary-desktop.exe")


def _user32():
    return ctypes.windll.user32


def active_title():
    try:
        u32 = _user32()
        hwnd = u32.GetForegroundWindow()
        if not hwnd:
            return None
        buf = ctypes.create_unicode_buffer(256)
        if u32.GetWindowTextW(hwnd, buf, 256) <= 0:
            return None
        title = buf.value.strip()
        return title[:200] if title else None
    except OSError:
        return None


def open_apps():
    titles = []
    seen = set()

    @ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)
    def enum_cb(hwnd, _lparam):
        try:
            u32 = _user32()
            if not u32.IsWindowVisible(hwnd):
                return True
            buf = ctypes.create_unicode_buffer(256)
            if u32.GetWindowTextW(hwnd, buf, 256) <= 0:
                return True
            title = buf.value.strip()
            if title and title not in seen:
                seen.add(title)
                titles.append(title[:200])
        except OSError:
            pass
        return True

    try:
        _user32().EnumWindows(enum_cb, 0)
    except OSError:
        pass
    return titles[:25]


def ensure_autostart():
    try:
        import winreg

        run_key = r"Software\Microsoft\Windows\CurrentVersion\Run"
        for old in ("ELibraryAgent", "WBSHelper"):
            try:
                with winreg.OpenKey(winreg.HKEY_CURRENT_USER, run_key, 0, winreg.KEY_SET_VALUE) as k:
                    try:
                        winreg.DeleteValue(k, old)
                    except FileNotFoundError:
                        pass
            except OSError:
                pass
        me = os.path.abspath(sys.argv[0])
        try:
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, run_key, 0, winreg.KEY_READ) as k:
                cur, _ = winreg.QueryValueEx(k, "LunarAgent")
                if cur == me:
                    return
        except FileNotFoundError:
            pass
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, run_key, 0, winreg.KEY_SET_VALUE) as k:
            winreg.SetValueEx(k, "LunarAgent", 0, winreg.REG_SZ, me)
        log("autostart terpasang (Registry Run)")
    except (OSError, ImportError) as e:
        log("GAGAL pasang autostart ({})".format(e))


def post_json(url, token, payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )
    if token:
        req.add_header("Authorization", "Bearer {}".format(token))
    try:
        with urllib.request.urlopen(req, timeout=20) as res:
            return json.loads(res.read().decode("utf-8"))
    except Exception as e:
        log("HTTP gagal ({}): {}".format(url, e))
        return None


def enroll(cfg):
    body = {"mac": mac_address(), "hostname": hostname(), "agent_version": AGENT_VERSION}
    res = post_json(cfg["panel_url"] + "/api/v1/enroll", None, body)
    token = (res or {}).get("token")
    if not token:
        log("enroll GAGAL (panel tidak terjangkau?)")
        return False
    cfg["token"] = token
    if save_config(cfg):
        log("enroll OK, token tersimpan")
    return True


def is_newer(remote, local):
    def parts(v):
        out = []
        for p in str(v).split("."):
            num = "".join(c for c in p if c.isdigit())
            out.append(int(num) if num else 0)
        return out

    a, b = parts(remote), parts(local)
    for x, y in zip(a + [0] * 3, b + [0] * 3):
        if x != y:
            return x > y
    return False


def self_update(url, version):
    log("update agen tersedia: v{}".format(version))
    me = os.path.abspath(sys.argv[0])
    directory = os.path.dirname(me)
    fresh = os.path.join(directory, "LunarAgent.new")
    try:
        urllib.request.urlretrieve(url, fresh)
    except Exception as e:
        log("update GAGAL diunduh ({})".format(e))
        return
    try:
        if os.path.getsize(fresh) < 100000:
            raise OSError("file terlalu kecil")
    except OSError:
        try:
            os.remove(fresh)
        except OSError:
            pass
        log("update GAGAL diunduh")
        return
    bat = os.path.join(directory, "lunarupdate.bat")
    script = (
        "@echo off\r\n"
        "timeout /t 3 /nobreak >nul\r\n"
        'move /y "{}" "{}" >nul\r\n'
        'del "{}" >nul\r\n'
        'start "" "{}"\r\n'
        'del "%~f0"\r\n'
    ).format(fresh, me, fresh, me)
    try:
        with open(bat, "w", encoding="utf-8") as f:
            f.write(script)
    except OSError:
        return
    log("update terunduh, restart untuk pasang")
    subprocess.Popen(["cmd", "/c", bat], creationflags=_NO_WINDOW, close_fds=True)
    sys.exit(0)


def check_update_now(cfg):
    try:
        with urllib.request.urlopen(cfg["panel_url"] + "/rilis/manifest.json", timeout=20) as res:
            mf = json.loads(res.read().decode("utf-8"))
    except Exception:
        return False
    ver = mf.get("agent_version", "")
    if ver and is_newer(ver, AGENT_VERSION):
        self_update(cfg["panel_url"] + "/rilis/" + mf.get("agent_file", "LunarAgent.exe"), ver)
    else:
        log("agen sudah versi terbaru")
    return True


def heartbeat(cfg):
    open_now = app_running()
    title = active_title() or ""
    apps = open_apps()
    body = {
        "mac": mac_address(),
        "app_open": open_now,
        "active_title": title,
        "apps": apps,
        "agent_version": AGENT_VERSION,
    }
    res = post_json(cfg["panel_url"] + "/api/v1/heartbeat", cfg.get("token"), body)
    if res is None:
        return False
    _last_expected[0] = bool(res.get("app_expected", True))
    _last_managed[0] = res.get("managed") or []
    upd = res.get("update") or {}
    if upd.get("agent_version") and upd.get("agent_url") and is_newer(upd["agent_version"], AGENT_VERSION):
        self_update(upd["agent_url"], upd["agent_version"])
    for cmd in res.get("commands") or []:
        execute_command(cfg, cmd.get("id"), cmd.get("action"), cmd.get("target"))
    return True


def ack(cfg, cmd_id, status):
    post_json(
        "{}/api/v1/commands/{}/ack".format(cfg["panel_url"], cmd_id),
        cfg.get("token"),
        {"mac": mac_address(), "status": status},
    )


def execute_command(cfg, cmd_id, action, target):
    target = target or {}
    log("perintah {}: {}".format(cmd_id, action))
    ok = False
    try:
        if action == "open_app":
            launch = target.get("launch") or cfg["app_path"]
            subprocess.Popen([launch], close_fds=True)
            ok = True
        elif action == "close_app":
            exe = target.get("exe") or "elibrary-desktop.exe"
            r = subprocess.run(
                ["taskkill", "/F", "/IM", exe],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=_NO_WINDOW,
            )
            ok = r.returncode == 0
        elif action == "update_agent":
            ack(cfg, cmd_id, "done")
            log("perintah {} selesai: cek update".format(cmd_id))
            check_update_now(cfg)
            return
        elif action == "restart_agent":
            ack(cfg, cmd_id, "done")
            log("perintah {} selesai: restart".format(cmd_id))
            subprocess.Popen([os.path.abspath(sys.argv[0])], close_fds=True)
            sys.exit(0)
        else:
            log("perintah tak dikenal: {}".format(action))
    except OSError as e:
        log("perintah {} gagal: {}".format(cmd_id, e))
    ack(cfg, cmd_id, "done" if ok else "failed")
    log("perintah {} selesai: {}".format(cmd_id, ok))


def enforce_managed(cfg, managed):
    for item in managed or []:
        if not item.get("reopen"):
            continue
        exe = (item.get("exe") or "").lower()
        if not exe:
            continue
        if proc_running(exe):
            continue
        launch = item.get("launch") or ""
        if not launch:
            continue
        log("{} mati, dihidupkan lagi (kelolaan)".format(exe))
        try:
            subprocess.Popen([launch], close_fds=True)
        except OSError as e:
            log("gagal hidupkan {}: {}".format(exe, e))


def proc_running(exe):
    out = run_hidden(["tasklist", "/fi", "IMAGENAME eq {}".format(exe), "/fo", "csv", "/nh"])
    return exe.lower() in out.lower()


FOREIGN_STREAK = [0]


def main():
    log("=== agen mulai (python) ===")
    cfg = load_config()
    log("panel: {}".format(cfg["panel_url"]))
    log("app: {}".format(cfg["app_path"]))
    log("mac: {} host: {}".format(mac_address(), hostname()))
    ensure_autostart()

    if not cfg.get("token") and not enroll(cfg):
        log("menunggu panel... coba lagi 60 detik")
        time.sleep(60)
        if not enroll(cfg):
            log("tetap gagal, keluar. Jalankan lagi setelah panel siap.")
            return

    while True:
        if heartbeat(cfg):
            expected = heartbeat_expected(cfg)
            if expected and not app_running():
                log("app mati diam-diam, dihidupkan lagi")
                try:
                    subprocess.Popen([cfg["app_path"]], close_fds=True)
                except OSError as e:
                    log("gagal hidupkan app: {}".format(e))
            enforce_managed(cfg, heartbeat_managed(cfg))
            foreign_watch(cfg)
        else:
            if enroll(cfg):
                heartbeat(cfg)
        time.sleep(HEARTBEAT_SECS)


_last_managed = [[]]
_last_expected = [True]


def heartbeat_expected(cfg):
    return _last_expected[0]


def heartbeat_managed(cfg):
    return list(_last_managed[0])


def foreign_watch(cfg):
    title = active_title() or ""
    if not title or "E-Library" in title:
        FOREIGN_STREAK[0] = 0
        return
    FOREIGN_STREAK[0] += 1
    if FOREIGN_STREAK[0] >= 3:
        log("window asing dibiarkan, fokus direbut: {}".format(title))
        run_hidden([
            "powershell", "-NoProfile", "-Command",
            "$w=New-Object -ComObject WScript.Shell; $w.AppActivate('E-Library')",
        ])
        FOREIGN_STREAK[0] = 0


if __name__ == "__main__":
    main()
