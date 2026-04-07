# Docker Security Fundamentals

> A deep dive into Docker's security model — namespaces, cgroups, capabilities, and when things go wrong.

---

## Introduction

Docker containers are often described as "lightweight VMs," but this description is misleading and dangerous from a security perspective. Unlike virtual machines, containers share the host kernel. This has profound security implications.

Understanding Docker's security model is essential for:

- **Defenders**: Hardening container deployments
- **Attackers**: Identifying container escape vectors
- **Lab creators**: Building realistic, isolated environments

---

## The Core: Linux Kernel Isolation

Docker security is built on four Linux kernel technologies:

| Technology | Purpose |
|---|---|
| **Namespaces** | Isolate process visibility (PID, network, mount, etc.) |
| **cgroups** | Limit and track resource usage (CPU, memory, I/O) |
| **Capabilities** | Fine-grained control over root privileges |
| **Seccomp/AppArmor** | Filter allowed syscalls and actions |

### Namespaces

Namespaces restrict what a process *can see*. A container uses:

- `PID namespace` — isolated process tree
- `NET namespace` — isolated network stack
- `MNT namespace` — isolated filesystem view
- `UTS namespace` — isolated hostname
- `IPC namespace` — isolated inter-process communication
- `USER namespace` — map container root to unprivileged host user

### cgroups

cgroups restrict what resources a process can *use*:

```bash
# Check cgroup limits on a running container
docker stats <container_id>

# Limit memory to 256MB
docker run --memory=256m ubuntu
```

---

## Where Docker Security Fails

### 1. Privileged Containers

```bash
# DANGEROUS — gives container nearly full host access
docker run --privileged ubuntu
```

A privileged container has nearly all Linux capabilities, can mount the host filesystem, and can interact with host devices. This is a trivial container escape.

### 2. Exposed Docker Socket

```bash
# Mounting the Docker socket gives full host control
docker run -v /var/run/docker.sock:/var/run/docker.sock ubuntu
```

If an attacker gains RCE inside a container with the Docker socket mounted, they can:
1. Create a new container with `--privileged` and `--pid=host`
2. `nsenter` into the host namespace
3. Full host compromise

### 3. Excessive Capabilities

The default Docker container runs with a reduced set of capabilities, but many deployments add dangerous ones:

```bash
# Dangerous capabilities
--cap-add SYS_ADMIN   # Mount filesystems, manage namespaces
--cap-add SYS_PTRACE  # Debug processes (potential escapes)
--cap-add NET_ADMIN   # Configure network interfaces
```

---

## Container Hardening Checklist

```bash
# Run as non-root
docker run --user 1001:1001 myapp

# Drop all capabilities, add only what's needed
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE nginx

# Read-only filesystem
docker run --read-only myapp

# No new privileges
docker run --security-opt=no-new-privileges myapp

# Limit resources
docker run --memory=512m --cpus=1.0 myapp
```

---

## Relevant Labs

- 🐳 **Docker Escape Challenge** — Hands-on exploitation of container misconfigurations
- 🐧 **Linux Privilege Escalation** — Understand the privilege model before attacking containers

---

## Further Reading

- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Linux Namespaces — man page](https://man7.org/linux/man-pages/man7/namespaces.7.html)
- [Understanding Capabilities](https://man7.org/linux/man-pages/man7/capabilities.7.html)

Happy (ethical) hacking!
