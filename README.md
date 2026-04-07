# Dock & Root Labs 🐳

**Containerized Cybersecurity Labs — Clone, Run, Hack.**

A free, open-source cybersecurity lab platform built on GitHub Pages. Every challenge runs locally on your Linux machine using Docker. No cloud accounts. No subscriptions.

🌐 **Website:** [dock-and-root-labs.github.io](https://dock-and-root-labs.github.io)

---

## Quick Start

```bash
# 1. Pick a lab from the website
# 2. Clone the lab repository
git clone https://github.com/dock-and-root-labs/<lab-name>
cd <lab-name>

# 3. Run it
docker compose up -d

# 4. Hack it, find the flag, and submit!
```

## Available Labs

| Lab | Difficulty | Category | Points |
|-----|-----------|----------|--------|
| SQL Injection 101 | Easy | Web | 100 |
| Linux Privilege Escalation | Medium | Linux | 250 |
| Docker Escape Challenge | Hard | Linux | 400 |
| Cryptography Fundamentals | Easy | Crypto | 100 |
| Buffer Overflow Basics | Medium | Pwn | 300 |
| Network Traffic Analysis | Medium | Networking | 250 |
| Reverse Engineering: Password Cracker | Easy | RE | 150 |
| Local File Inclusion | Medium | Web | 250 |

## Project Structure

```
Dock&Root/
├── index.html          # Home page
├── labs.html           # Lab catalog with search/filter
├── lab.html            # Individual lab detail (URL-param driven)
├── about.html          # About page
├── writeups.html       # Writeups listing
├── blog/
│   ├── index.html      # Blog listing
│   ├── post.html       # Blog post reader (Marked.js)
│   └── posts/          # Markdown blog posts
├── css/
│   └── style.css       # Dark cybersecurity theme
└── js/
    ├── app.js          # Navbar, footer, utilities
    ├── labs.js         # Lab data & helpers
    └── blog.js         # Blog metadata & helpers
```

## Deploying to GitHub Pages

1. Push this directory to the `gh-pages` branch (or `main` with Pages configured to root)
2. Enable GitHub Pages in repository Settings → Pages → Source: root
3. The site will be available at `https://<username>.github.io/<repo>/`

For a custom domain, create a `CNAME` file with your domain name.

## Contributing

- **New Labs:** Open an issue in the lab repository with your idea
- **Bug Reports:** Open an issue in this repository
- **Blog Posts:** Submit a PR adding a Markdown file to `blog/posts/`

## License

MIT License — Free to use, modify, and distribute.

---

*Built for the cybersecurity community.*
