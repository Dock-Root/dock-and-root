// Getting Started with Dock and Root Labs

# Getting Started with Dock and Root Labs

Welcome to **Dock and Root Labs** — your go-to platform for hands-on cybersecurity practice using Docker-based challenges. This guide will walk you through setting up your environment and running your first lab.

---

## Prerequisites

Before you dive in, make sure you have the following installed on your Linux machine:

- **Docker** (v20.10 or newer)
- **Docker Compose** (v2.x recommended)
- **Git**

### Install Docker (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install docker.io docker-compose-plugin -y
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

> 💡 Log out and back in after adding yourself to the `docker` group.

### Verify your installation

```bash
docker --version
docker compose version
git --version
```

---

## How Labs Work

Each Dock and Root Lab is a self-contained GitHub repository that you clone to your machine and run locally using Docker.

### Step 1: Find a Lab

Browse the [Labs page](/machines.html) and pick a challenge that interests you. Each lab shows:
- Difficulty: Easy / Medium / Hard
- Category: Web, Linux, Crypto, etc.
- Estimated time
- Required skills

### Step 2: Clone the Repository

Click **"Clone Repository"** on the lab page or run:

```bash
git clone https://github.com/dock-and-root-labs/<lab-name>
cd <lab-name>
```

### Step 3: Start the Lab

```bash
docker compose up -d
```

The lab environment will start in detached mode. Read the `README.md` in the repo for connection details.

### Step 4: Hack It

Interact with the challenge, exploit vulnerabilities, and find the flag. Flags are usually in the format:

```
DRL{s0me_s3cr3t_flag_here}
```

### Step 5: Submit Your Flag

Once you have the flag, head back to the lab page on the website and use one of the submission options:
- Open a GitHub Issue with your flag
- Submit via the provided Google Form

---

## Tips for Beginners

1. **Read the README** — Every lab has setup instructions and hints in the README.md
2. **Start Easy** — Begin with Easy difficulty labs to build confidence
3. **Use Google** — Most techniques have detailed public resources
4. **Don't give up** — Struggling is part of learning

---

## Tools Recommended

| Category | Tools |
|---|---|
| Web Testing | Burp Suite, curl, ffuf |
| Network | Wireshark, nmap, netcat |
| Binary/RE  | GDB, Ghidra, Radare2, pwntools |
| General | Python3, CyberChef, jq |

---

## Need Help?

- Open a [GitHub Discussion](https://github.com/dock-and-root-labs) in the lab repository
- Check existing Issues for hints
- Join the community Discord (coming soon!)

Happy hacking! 🎉
