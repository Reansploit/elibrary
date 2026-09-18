<!doctype html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LUNAR — Local Unified Network Agent Remote</title>
  <style>
    :root {
      --brand: #360f5a;
      --brand-ink: #FFFFFF;
      --brand-dark: #270941;
      --brand-soft: #F1E4F9;
      --ink: #1C1917;
      --muted: #78716C;
      --line: #E7E5E4;
      --bg: #FFFFF0;
      --card: #FFFFFF;
      --ok: #059669;
      --ok-soft: #ECFDF5;
      --warn: #B45309;
      --warn-soft: #FFFBEB;
      --bad: #DC2626;
      --bad-soft: #FEF2F2;
      --info: #0284C7;
      --info-soft: #F0F9FF;
    }
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; margin: 0; background: var(--bg); color: var(--ink); }
    .wrap { max-width: 1100px; margin: 0 auto; padding: 20px 16px 40px; }
    header.top { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand .dot { width: 34px; height: 34px; border-radius: 10px; overflow: hidden; background: var(--brand-soft); }
    .brand .dot img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .brand b { display: block; font-size: 15px; letter-spacing: 2px; }
    .brand small { color: var(--muted); font-size: 11px; }
    .grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    @media (max-width: 800px) { .grid4 { grid-template-columns: repeat(2, 1fr); } }
    .card { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 16px; box-shadow: 0 1px 2px rgba(0,0,0,.04); }
    .stat .n { font-size: 26px; font-weight: 800; margin-top: 4px; }
    .stat .l { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
    .toolbar { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin: 16px 0 12px; }
    input, select, button { font-size: 14px; border-radius: 9px; }
    input, select { border: 1px solid var(--line); padding: 9px 12px; background: #fff; }
    input:focus, select:focus { outline: 2px solid var(--brand); border-color: var(--brand); }
    .btn { border: 1px solid var(--line); background: #fff; padding: 9px 14px; cursor: pointer; font-weight: 600; }
    .btn:hover { background: var(--bg); }
    .btn.primary { background: var(--brand); border-color: var(--brand-dark); color: var(--brand-ink); }
    .btn.primary:hover { background: var(--brand-dark); }
    .btn.danger { background: var(--bad); border-color: var(--bad); color: #fff; }
    .btn.ok { background: var(--ok); border-color: var(--ok); color: #fff; }
    .btn.sm { padding: 6px 10px; font-size: 12px; }
    .btn:disabled { opacity: .55; cursor: wait; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: var(--muted); padding: 10px 12px; border-bottom: 1px solid var(--line); }
    td { padding: 10px 12px; border-bottom: 1px solid var(--line); vertical-align: top; }
    tr:last-child td { border-bottom: 0; }
    tbody tr[data-id] { cursor: pointer; }
    tbody tr[data-id]:hover { background: var(--brand-soft); }
    .mono { font-family: ui-monospace, Consolas, monospace; font-size: 12px; }
    .pill { display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; padding: 3px 10px; font-size: 12px; font-weight: 600; }
    .pill .d { width: 7px; height: 7px; border-radius: 999px; background: currentColor; }
    .p-ok { background: var(--ok-soft); color: var(--ok); }
    .p-off { background: #F5F5F4; color: var(--muted); }
    .p-info { background: var(--info-soft); color: var(--info); }
    .p-bad { background: var(--bad-soft); color: var(--bad); }
    .p-warn { background: var(--warn-soft); color: var(--warn); }
    .chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .chip { background: var(--bg); border: 1px solid var(--line); border-radius: 8px; padding: 5px 9px; font-size: 12px; max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .tabs { display: inline-flex; gap: 4px; background: #fff; border: 1px solid var(--line); border-radius: 10px; padding: 4px; }
    .tabs button { border: 0; background: none; padding: 7px 14px; border-radius: 7px; cursor: pointer; font-weight: 600; color: var(--muted); }
    .tabs button.on { background: var(--brand); color: var(--brand-ink); }
    .timeline { position: relative; }
    .timeline .ev { position: relative; padding: 0 0 16px 22px; }
    .timeline .ev::before { content: ""; position: absolute; left: 4px; top: 16px; bottom: 0; width: 1px; background: var(--line); }
    .timeline .ev:last-child::before { display: none; }
    .timeline .dot { position: absolute; left: 0; top: 5px; width: 9px; height: 9px; border-radius: 999px; }
    .center { max-width: 400px; margin: 8vh auto; }
    .err { background: var(--bad-soft); color: var(--bad); border: 1px solid #FECACA; border-radius: 10px; padding: 10px 12px; font-size: 13px; margin-bottom: 12px; }
    .okmsg { background: var(--ok-soft); color: var(--ok); border: 1px solid #A7F3D0; border-radius: 10px; padding: 10px 12px; font-size: 13px; margin-bottom: 12px; }
    .rowbtns { display: flex; gap: 8px; flex-wrap: wrap; }
    .muted { color: var(--muted); font-size: 12px; }
    .hidden { display: none !important; }
  </style>
</head>
<body>
  <div class="wrap" id="app"></div>
  <script>
    const $app = document.getElementById('app');
    const store = {
      get server() { return (localStorage.getItem('lunar_server') || '').replace(/\/+$/, ''); },
      get token() { return localStorage.getItem('lunar_token') || ''; },
      get user() { try { return JSON.parse(localStorage.getItem('lunar_user') || 'null'); } catch { return null; } },
    };
    let timer = null;
    let wtimer = null;
    let lastAlerts = 0;
    let audioCtx = null;

    function beep() {
      try {
        audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        o.frequency.value = 880;
        g.gain.setValueAtTime(0.001, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.4, audioCtx.currentTime + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        o.start();
        o.stop(audioCtx.currentTime + 0.55);
      } catch {}
    }

    function toast(msg) {
      let box = document.getElementById('toasts');
      if (!box) {
        box = document.createElement('div');
        box.id = 'toasts';
        box.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:999;display:grid;gap:8px;max-width:320px';
        document.body.appendChild(box);
      }
      const el = document.createElement('div');
      el.style.cssText = 'background:#7F1D1D;color:#fff;border-radius:10px;padding:10px 14px;font-size:13px;box-shadow:0 4px 14px rgba(0,0,0,.25)';
      el.textContent = msg;
      box.appendChild(el);
      setTimeout(() => el.remove(), 8000);
    }

    // Bunyikan + toast tiap ada alert baru yang belum ditangani.
    function watchAlerts(n) {
      if (n > lastAlerts) {
        const fresh = n - lastAlerts;
        beep();
        toast(fresh === 1 ? '1 alert baru perlu perhatian.' : fresh + ' alert baru perlu perhatian.');
      }
      lastAlerts = n;
      document.title = n > 0 ? `(${n}) LUNAR` : 'LUNAR';
    }

    function esc(s) {
      return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // Tauri invoke melempar string polos (bukan Error) — normalisasi di sini.
    function errMsg(e) {
      if (!e) return 'Tidak diketahui';
      if (typeof e === 'string') return e;
      return e.message || String(e);
    }

    async function api(path, opts = {}) {
      const res = await fetch('/api/v1/manager' + path, {
        ...opts,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: 'Bearer ' + store.token, ...(opts.headers || {}) },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      });
      if (res.status === 401) { logout(true); throw new Error('Sesi habis, masuk lagi.'); }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || ('HTTP ' + res.status));
      return data;
    }

    function logout(silent) {
      localStorage.removeItem('lunar_token');
      localStorage.removeItem('lunar_user');
      lastAlerts = 0;
      document.title = 'LUNAR';
      clearInterval(timer);
      clearInterval(wtimer);
      if (!silent) render();
    }

    function shell(inner, active) {
      const u = store.user || {};
      const desktop = !!(window.__TAURI__ && window.__TAURI__.core);
      return `
        <header class="top">
          <div class="brand"><span class="dot"><img src="/lunar-app/lunar.svg" alt="LUNAR"></span><span><b>LUNAR</b><small>Local Unified Network Agent Remote</small></span></div>
          <div style="display:flex;gap:8px;align-items:center">
            <div class="tabs">
              <button class="${active === 'apps' ? 'on' : ''}" onclick="viewApps()">Aplikasi</button>
              <button class="${active !== 'apps' ? 'on' : ''}" onclick="viewDash()">Perangkat</button>
            </div>
            <span class="pill ${desktop ? 'p-ok' : 'p-warn'}" title="${desktop ? 'WinRM aktif' : 'Buka lewat app desktop LUNAR untuk remote WinRM'}">${desktop ? 'Desktop' : 'Browser'}</span>
            <span class="muted">${esc(u.name || '')}</span>
            <button class="btn sm" onclick="logout()">Keluar</button>
          </div>
        </header>
        ${inner}`;
    }

    function pill(text, kind) {
      return `<span class="pill p-${kind}"><span class="d"></span>${esc(text)}</span>`;
    }

    // ---------- layar: login ----------
    function viewLogin(msg = '') {
      clearInterval(timer);
      $app.innerHTML = `
        <div class="center">
          <div class="card">
            <div class="brand" style="margin-bottom:12px"><span class="dot"><img src="/lunar-app/lunar.svg" alt="LUNAR"></span><span><b>LUNAR</b><small>Masuk guru pengelola</small></span></div>
            ${msg ? `<div class="err">${esc(msg)}</div>` : ''}
            <input id="em" type="text" style="width:100%;margin-bottom:8px" placeholder="Username" autocomplete="username">
            <input id="pw" type="password" style="width:100%;margin-bottom:12px" placeholder="Password" autocomplete="current-password"
              onkeydown="if(event.key==='Enter')doLogin()">
            <button class="btn primary" style="width:100%" onclick="doLogin()">Masuk</button>
          </div>
        </div>`;
    }
    async function doLogin() {
      const username = document.getElementById('em').value.trim();
      const password = document.getElementById('pw').value;
      try {
        const res = await fetch('/api/v1/manager/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ username, password, device_name: 'lunar' }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Gagal masuk.');
        localStorage.setItem('lunar_token', data.token);
        localStorage.setItem('lunar_user', JSON.stringify(data.user));
        viewDash();
      } catch (e) {
        viewLogin(errMsg(e));
      }
    }

    // ---------- layar: aplikasi kelolaan ----------
    let appsCache = [];
    async function viewApps() {
      clearInterval(timer);
      $app.innerHTML = shell(`<div id="apps"><p class="muted">Memuat…</p></div>`, 'apps');
      try {
        const data = await api('/apps');
        appsCache = data.apps || [];
        document.getElementById('apps').innerHTML = appsHtml();
      } catch (e) {
        document.getElementById('apps').innerHTML = `<div class="err">${esc(errMsg(e))}</div>`;
      }
    }
    function appsHtml() {
      return `
        <div class="card" style="margin-bottom:12px">
          <b>Tambah aplikasi</b>
          <p class="muted">exe = nama proses (mis. chrome.exe). launch = perintah jalan (path exe / URL / shell command).</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
            <input id="an" placeholder="Nama (mis. Chrome)" style="flex:2;min-width:140px">
            <input id="ae" placeholder="chrome.exe" style="flex:1;min-width:120px" class="mono">
            <input id="al" placeholder="C:\\...\\chrome.exe" style="flex:3;min-width:180px" class="mono">
            <label style="display:flex;gap:6px;align-items:center;font-size:13px"><input type="checkbox" id="ar"> Buka otomatis</label>
            <button class="btn primary" onclick="doAddApp()">Tambah</button>
          </div>
        </div>
        <div class="card" style="padding:0;overflow:hidden">
          <table>
            <thead><tr><th>Aplikasi</th><th>Exe</th><th>Buka otomatis</th><th style="text-align:right">Aksi</th></tr></thead>
            <tbody>
              ${appsCache.length ? appsCache.map((a) => `
                <tr>
                  <td><b>${esc(a.name)}</b><br><span class="mono muted">${esc(a.launch)}</span></td>
                  <td class="mono">${esc(a.exe)}</td>
                  <td><input type="checkbox" ${a.auto_reopen ? 'checked' : ''} onchange="doToggleApp(${a.id},this.checked)" aria-label="Buka otomatis"></td>
                  <td style="text-align:right"><button class="btn sm danger" onclick="if(confirm('Hapus ${esc(a.name)}?'))doDelApp(${a.id})">Hapus</button></td>
                </tr>`).join('') : `<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:24px">Belum ada aplikasi. Tambahkan di atas.</td></tr>`}
            </tbody>
          </table>
        </div>`;
    }
    let addingPc = false;
    let regMsg = '';
    let regOk = false;
    async function doAddPc() {
      if (addingPc) return;
      const el = document.getElementById('nh');
      const macEl = document.getElementById('nmac');
      const msg = document.getElementById('addmsg');
      const host = (el.value || '').trim();
      if (!host) return;
      addingPc = true;
      msg.textContent = 'Menghubungi… (maks 45 detik)';
      try {
        let mac = (macEl.value || '').trim().toUpperCase().replace(/-/g, ':');
        if (!mac) {
          // Otomatis via WinRM — hanya di app desktop.
          if (!(window.__TAURI__ && window.__TAURI__.core)) {
            throw new Error('isi MAC manual (lihat di PC: ipconfig /all), atau buka lewat app desktop LUNAR.');
          }
          const raw = await withTimeout(
            winrm(host, "Get-NetAdapter | Where-Object { $_.Status -eq 'Up' -and $_.MacAddress } | Select-Object -First 1 -ExpandProperty MacAddress"),
            45000,
            'PC tidak merespons. Pastikan menyala, se-network, dan Enable-Remoting sudah jalan di sana.'
          );
          mac = raw.trim().toUpperCase().replace(/-/g, ':');
        }
        if (!/^(?:[0-9A-F]{2}:){5}[0-9A-F]{2}$/.test(mac)) throw new Error('MAC tidak valid (format XX:XX:XX:XX:XX:XX).');
        await api('/devices/sync', {
          method: 'POST',
          body: { mac, hostname: host, ip: host, app_open: false, apps: [] },
        });
        msg.textContent = 'Terdaftar: ' + mac;
        regMsg = 'Terdaftar: ' + mac;
        regOk = true;
        el.value = '';
        macEl.value = '';
        loadDash();
      } catch (e) {
        msg.textContent = 'Gagal: ' + errMsg(e);
        regMsg = 'Gagal: ' + errMsg(e);
        regOk = false;
      } finally {
        addingPc = false;
      }
    }
    async function doAddApp() {
      const body = {
        name: document.getElementById('an').value.trim(),
        exe: document.getElementById('ae').value.trim(),
        launch: document.getElementById('al').value.trim(),
        auto_reopen: document.getElementById('ar').checked,
      };
      if (!body.name || !body.exe || !body.launch) { alert('Nama, exe, dan launch wajib diisi.'); return; }
      await api('/apps', { method: 'POST', body });
      viewApps();
    }
    async function doToggleApp(id, on) {
      await api(`/apps/${id}`, { method: 'PATCH', body: { auto_reopen: on } });
      const a = appsCache.find((x) => x.id === id);
      if (a) a.auto_reopen = on;
    }
    async function doDelApp(id) {
      await api(`/apps/${id}`, { method: 'DELETE' });
      viewApps();
    }

    // ---------- worker WinRM: pantau + eksekusi langsung ke tiap PC ----------
    // Syarat PC target: Enable-PSRemoting + akun admin lokal yang sama.
    // Kredensial tersimpan di PC guru ini saja (localStorage), tidak dikirim ke mana pun selain PC target.
    function wcreds() {
      return {
        user: localStorage.getItem('lunar_winrm_user') || '',
        pass: localStorage.getItem('lunar_winrm_pass') || '',
      };
    }
    async function winrm(host, script) {
      const { user, pass } = wcreds();
      if (!user) throw new Error('Isi kredensial Windows dulu.');
      const mod = window.__TAURI__ && window.__TAURI__.core;
      if (!mod) throw new Error('Hanya jalan di app desktop LUNAR.');
      return await mod.invoke('winrm_exec', { host, user, pass: pass || '', script });
    }
    const psQ = (s) => `'${String(s).replace(/'/g, "''")}'`;

    // Batas waktu agar satu PC macet tidak menggantung seluruh UI/worker.
    function withTimeout(promise, ms, label) {
      let timer = null;
      const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(label || 'Waktu habis.')), ms);
      });
      return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
    }

    async function workerOnce() {
      const { user, pass } = wcreds();
      if (!user || !store.token) return;
      let devices = [];
      try {
        const dd = await api('/devices');
        devices = dd.devices || [];
      } catch { return; }
      for (const d of devices) {
        const host = d.ip || d.hostname;
        if (!host) continue;
        try {
          // 1. Status: daftar proses ber-window (batas 30 dtk per PC).
          const out = await withTimeout(
            winrm(host, "Get-Process | Where-Object { $_.MainWindowTitle } | ForEach-Object { $_.ProcessName + '|' + $_.MainWindowTitle }"),
            30000,
            'timeout'
          );
          const seen = out.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
          const procs = seen.map((l) => l.split('|')[0].toLowerCase());
          const apps = seen.slice(0, 25);
          const open = procs.includes('elibrary-desktop');
          // 2. Sinkron ke panel (aturan log/alert sama di server).
          await api('/devices/sync', { method: 'POST', body: { mac: d.mac, hostname: d.hostname, ip: d.ip, app_open: open, active_title: null, apps } });
          // 3. Antrean perintah khusus PC ini (termasuk daftar kelolaan).
          const pd = await api(`/devices/${d.id}/pending`);
          // 4. Tegakkan buka-otomatis khusus PC ini.
          for (const m of (pd.managed || [])) {
            if (m.auto_reopen && !procs.includes(m.exe.replace(/\.exe$/i, '').toLowerCase())) {
              await winOpen(host, m.launch);
            }
          }
          // 5. Eksekusi antrean perintah.
          for (const c of (pd.commands || [])) {
            try {
              await execCommand(host, c);
              await api(`/commands/${c.id}/result`, { method: 'POST', body: { status: 'done' } });
            } catch {
              await api(`/commands/${c.id}/result`, { method: 'POST', body: { status: 'failed' } });
            }
          }
        } catch {
          // PC mati / WinRM tolak — panel tandai offline dari last_seen.
        }
      }
      const el = document.getElementById('wstatus');
      if (el) el.textContent = 'Worker: ' + new Date().toLocaleTimeString('id-ID');
    }
    async function winOpen(host, launch) {
      const { user } = wcreds();
      const task = 'LUNAR_' + Date.now().toString(36);
      const script = `schtasks /create /tn ${task} /tr ${psQ(launch)} /sc once /st 00:00 /ru ${psQ(user)} /it /f | Out-Null; schtasks /run /tn ${task} | Out-Null; Start-Sleep -Seconds 3; schtasks /delete /tn ${task} /f | Out-Null; 'OK'`;
      await winrm(host, script);
    }
    function exeName(exe) {
      return String(exe || '').replace(/\.exe$/i, '');
    }
    async function execCommand(host, c) {
      const t = c.target || {};
      if (c.action === 'open_app') {
        if (t.launch) await winOpen(host, t.launch);
        else throw new Error('tanpa target');
      } else if (c.action === 'close_app') {
        const exe = t.exe || 'elibrary-desktop.exe';
        await winrm(host, `Stop-Process -Name ${psQ(exeName(exe))} -Force; 'OK'`);
      } else {
        throw new Error('tidak didukung mode WinRM');
      }
    }
    function startWorker() {
      clearInterval(wtimer);
      workerOnce();
      wtimer = setInterval(workerOnce, 25000);
    }

    // ---------- layar: dashboard ----------
    let dashTab = 'semua', dashQ = '';
    async function viewDash() {
      clearInterval(timer);
      $app.innerHTML = shell(`<div id="dash"><p class="muted">Memuat…</p></div>`);
      await loadDash();
      timer = setInterval(loadDash, 15000);
      startWorker();
    }
    async function loadDash() {
      try {
        const data = await api('/devices');
        watchAlerts(data.stats ? data.stats.alerts : 0);
        const rows = (data.devices || []).filter((d) => {
          if (dashTab === 'online' && !d.online) return false;
          if (dashTab === 'perhatian' && !(d.unhandled_alerts > 0 || !d.online)) return false;
          if (dashQ) {
            const q = dashQ.toLowerCase();
            return (d.name + ' ' + d.hostname + ' ' + d.mac + ' ' + (d.ip || '')).toLowerCase().includes(q);
          }
          return true;
        });
        const el = document.getElementById('dash');
        if (el) el.innerHTML = dashHtml(data.stats, rows);
      } catch (e) {
        const el = document.getElementById('dash');
        if (el) el.innerHTML = `<div class="err">${esc(errMsg(e))}</div>`;
      }
    }
    function dashHtml(s, rows) {
      const { user, pass } = wcreds();
      return `
        <div class="card" style="margin-bottom:12px">
          <b>Tambah PC baru</b>
          <span class="muted"> — tanpa install apa pun di PC-nya. Cukup WinRM aktif + se-network.</span>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
            <input id="nh" placeholder="Hostname atau IP (mis. 192.168.2.21)" style="flex:2;min-width:180px" class="mono">
            <input id="nmac" placeholder="MAC (opsional, mis. AA:BB:..)" style="flex:2;min-width:180px" class="mono">
            <button class="btn sm primary" onclick="doAddPc()">Daftarkan</button>
            <span class="muted" id="addmsg" style="${regOk ? 'color:var(--ok);font-weight:600' : ''}">${esc(regMsg)}</span>
          </div>
        </div>
        <div class="card" style="margin-bottom:12px">
          <b>Kredensial PC client</b>
          <span class="muted"> — akun admin lokal yang sama di semua PC (password boleh kosong bila registry sudah dibuka script). Tersimpan di PC ini saja.</span>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
            <input id="wu" placeholder="Username" value="${esc(user)}" style="flex:1;min-width:140px" autocomplete="off">
            <input id="wp" type="password" placeholder="Password" value="${esc(pass)}" style="flex:1;min-width:140px" autocomplete="off">
            <button class="btn sm primary" onclick="localStorage.setItem('lunar_winrm_user',document.getElementById('wu').value.trim());localStorage.setItem('lunar_winrm_pass',document.getElementById('wp').value);loadDash();workerOnce()">Simpan & uji</button>
            <span class="muted" id="wstatus"></span>
          </div>
        </div>
        <div class="grid4">
          <div class="card stat"><div class="l">Total PC</div><div class="n">${s.total}</div></div>
          <div class="card stat"><div class="l">Online</div><div class="n" style="color:var(--ok)">${s.online}</div></div>
          <div class="card stat"><div class="l">App terbuka</div><div class="n" style="color:var(--info)">${s.app_open}</div></div>
          <div class="card stat"><div class="l">Perlu perhatian</div><div class="n" style="color:${s.alerts ? 'var(--bad)' : 'inherit'}">${s.alerts}</div></div>
        </div>
        <div class="toolbar">
          <div class="tabs">
            ${[['semua', 'Semua'], ['online', 'Online'], ['perhatian', 'Perhatian']].map(([v, l]) =>
              `<button class="${dashTab === v ? 'on' : ''}" onclick="dashTab='${v}';loadDash()">${l}</button>`).join('')}
          </div>
          <input placeholder="Cari nama, MAC, IP…" value="${esc(dashQ)}" oninput="dashQ=this.value;loadDash()" style="flex:1;min-width:180px">
        </div>
        <div class="card" style="padding:0;overflow:hidden">
          <table>
            <thead><tr><th>Perangkat</th><th>Jaringan</th><th>Status</th><th>App</th><th style="text-align:right">Terakhir lapor</th></tr></thead>
            <tbody>
              ${rows.length ? rows.map((d) => `
                <tr data-id="${d.id}" onclick="viewDetail(${d.id})">
                  <td><b>${esc(d.name)}</b>${d.unhandled_alerts ? ` <span class="pill p-bad">${d.unhandled_alerts}</span>` : ''}<br><span class="mono muted">${esc(d.hostname)}</span></td>
                  <td class="mono">${esc(d.mac)}<br><span class="muted">${esc(d.ip || '-')}</span></td>
                  <td>${d.online ? pill('Online', 'ok') : pill('Offline', 'off')}</td>
                  <td>${d.app_open ? pill('Terbuka', 'info') : pill('Tertutup', 'off')}</td>
                  <td style="text-align:right" class="muted">${esc(d.last_seen_human || 'Belum pernah')}</td>
                </tr>`).join('') : `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:24px">Tidak ada PC yang cocok.</td></tr>`}
            </tbody>
          </table>
        </div>`;
    }

    // ---------- layar: detail ----------
    let detTab = 'ringkasan';
    async function viewDetail(id) {
      clearInterval(timer);
      $app.innerHTML = shell(`<div id="det"><p class="muted">Memuat…</p></div>`);
      await loadDetail(id);
      timer = setInterval(() => loadDetail(id, true), 15000);
    }
    async function loadDetail(id, quiet) {
      try {
        if (!appsCache.length) {
          try {
            const ad = await api('/apps');
            appsCache = ad.apps || [];
          } catch { appsCache = []; }
        }
        const data = await api('/devices/' + id);
        data.assigned = data.assigned_app_ids || [];
        const el = document.getElementById('det');
        if (el) el.innerHTML = detHtml(data);
      } catch (e) {
        if (!quiet) {
          const el = document.getElementById('det');
          if (el) el.innerHTML = `<div class="err">${esc(errMsg(e))}</div><button class="btn" onclick="viewDash()">Kembali</button>`;
        }
      }
    }
    function detHtml({ device: d, pending, alerts, logs, assigned }) {
      const unhandled = (alerts || []).filter((a) => !a.handled);
      return `
        <p><button class="btn sm" onclick="viewDash()">← Kembali</button></p>
        <div class="card" style="margin:12px 0">
          <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center">
            <div><h2 style="margin:0">${esc(d.name)}</h2><div class="mono muted">${esc(d.hostname)} • ${esc(d.mac)}</div></div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              ${d.online ? pill('Online', 'ok') : pill('Offline', 'off')}
              ${d.app_open ? pill('App terbuka', 'info') : pill('App tertutup', 'off')}
              <button class="btn sm danger" onclick="if(confirm('Hapus perangkat ini?'))doDel(${d.id})">Hapus</button>
            </div>
          </div>
        </div>
        <div class="tabs" style="margin-bottom:12px">
          <button class="${detTab === 'ringkasan' ? 'on' : ''}" onclick="detTab='ringkasan';loadDetail(${d.id})">Ringkasan</button>
          <button class="${detTab === 'aktivitas' ? 'on' : ''}" onclick="detTab='aktivitas';loadDetail(${d.id})">Aktivitas</button>
        </div>
        ${detTab === 'ringkasan' ? `
        <div class="card" style="margin-bottom:12px">
          <b>Aplikasi wajib PC ini</b>
          <span class="muted"> — kosongkan semua = ikut global. Yang buka-otomatis dihidupkan lagi bila mati.</span>
          <div style="display:grid;gap:6px;margin-top:8px">
            ${appsCache.map((a) => `<label style="display:flex;gap:8px;align-items:center;font-size:13px">
              <input type="checkbox" data-appid="${a.id}" ${(assigned || []).includes(a.id) ? 'checked' : ''}>
              <span><b>${esc(a.name)}</b> <span class="mono muted">${esc(a.exe)}</span>${a.auto_reopen ? ' <span class="pill p-info">otomatis</span>' : ''}</span>
            </label>`).join('') || '<span class="muted">Belum ada aplikasi — tambah di menu Aplikasi.</span>'}
          </div>
          <button class="btn sm primary" style="margin-top:8px" onclick="doAssign(${d.id})">Simpan pilihan</button>
        </div>
        <div class="card" style="margin-bottom:12px">
          <b>Aplikasi terbuka (${(d.open_apps || []).length})</b>
          <div class="muted">Window depan: ${esc(d.active_title || '-')}</div>
          <div class="chips" style="margin-top:8px">${(d.open_apps || []).map((a) => `<span class="chip" title="${esc(a)}">${esc(a)}</span>`).join('') || '<span class="muted">-</span>'}</div>
        </div>
        <div class="grid4" style="grid-template-columns:repeat(3,1fr)">
          <div class="card">
            <b>Info</b>
            <p class="muted">IP: <span class="mono">${esc(d.ip || '-')}</span><br>Agen: v${esc(d.agent_version || '-')}</p>
            <div style="display:flex;gap:6px;margin-top:8px">
              <input id="rn" placeholder="Nama baru" style="flex:1;min-width:0">
              <button class="btn sm" onclick="doRename(${d.id})">Rename</button>
            </div>
          </div>
          <div class="card">
            <b>Perintah remote</b>
            <div class="rowbtns" style="margin-top:8px">
              <button class="btn sm ok" onclick="doCmd(${d.id},'open_app')">Buka app</button>
              <button class="btn sm danger" onclick="doCmd(${d.id},'close_app')">Tutup app</button>
              <button class="btn sm" onclick="doCmd(${d.id},'restart_agent')">Restart agen</button>
              <button class="btn sm" onclick="doCmd(${d.id},'update_agent')">Update agen</button>
            </div>
            <div style="display:flex;gap:6px;margin-top:8px">
              <select id="appick" style="flex:1;min-width:0">
                ${appsCache.map((a) => `<option value="${a.id}">${esc(a.name)}</option>`).join('') || '<option value="">(belum ada aplikasi)</option>'}
              </select>
              <button class="btn sm ok" onclick="doAppCmd(${d.id},'open_app')">Buka</button>
              <button class="btn sm danger" onclick="doAppCmd(${d.id},'close_app')">Tutup</button>
            </div>
            ${(pending || []).map((c) => `<p class="muted">${esc(c.label)} — menunggu <button class="btn sm" onclick="doCancel(${c.id},${d.id})">Batalkan</button></p>`).join('')}
          </div>
          <div class="card">
            <b>Alert (${unhandled.length} aktif)</b>
            <div style="margin-top:8px;display:grid;gap:8px">
              ${(alerts || []).map((a) => `<div style="border:1px solid var(--line);border-radius:9px;padding:8px;${a.handled ? 'opacity:.55' : ''}">
                <b style="font-size:13px">${esc(a.label)}</b><div class="muted">${esc(a.message)} • ${esc(a.at || '')}</div>
                ${a.handled ? '' : `<button class="btn sm" style="margin-top:6px" onclick="doHandle(${a.id},${d.id})">Tandai selesai</button>`}
              </div>`).join('') || '<span class="muted">Tidak ada.</span>'}
            </div>
          </div>
        </div>` : `
        <div class="card timeline">
          ${(logs || []).map((l) => `<div class="ev"><span class="dot" style="background:var(--brand)"></span>
            <b style="font-size:13px">${esc(l.label)}</b><div class="muted">${esc(l.detail || '')} ${esc(l.at || '')}</div></div>`).join('') || '<span class="muted">Belum ada aktivitas.</span>'}
        </div>`}`;
    }
    async function doAssign(id) {
      const ids = [...document.querySelectorAll('#assignbox input[data-appid]:checked')].map((el) => Number(el.dataset.appid));
      await api(`/devices/${id}/apps`, { method: 'PUT', body: { app_ids: ids } });
      loadDetail(id);
    }
    async function doCmd(id, action) {
      await api(`/devices/${id}/commands`, { method: 'POST', body: { action } });
      loadDetail(id);
    }
    async function doAppCmd(id, action) {
      const sel = document.getElementById('appick');
      if (!sel || !sel.value) { alert('Pilih aplikasinya dulu (tambah di menu Aplikasi bila kosong).'); return; }
      await api(`/devices/${id}/commands`, { method: 'POST', body: { action, managed_app_id: Number(sel.value) } });
      loadDetail(id);
    }
    async function doCancel(cid, id) {
      await api(`/commands/${cid}/cancel`, { method: 'POST' });
      loadDetail(id);
    }
    async function doHandle(aid, id) {
      await api(`/alerts/${aid}/handle`, { method: 'POST' });
      loadDetail(id);
    }
    async function doRename(id) {
      const v = document.getElementById('rn').value;
      await api(`/devices/${id}`, { method: 'PATCH', body: { custom_name: v } });
      loadDetail(id);
    }
    async function doDel(id) {
      await api(`/devices/${id}`, { method: 'DELETE' });
      viewDash();
    }

    function render() {
      if (!store.token) return viewLogin();
      viewDash();
    }
    render();
  </script>
</body>
</html>
