// ===================================================
// DOCK AND ROOT LABS — Blog Post Data
// ===================================================

const BLOG_POSTS = [
    {
        id: 1,
        slug: "getting-started-with-dock-and-root",
        title: "Getting Started with Dock and Root Labs",
        emoji: "🚀",
        date: "2025-01-10",
        author: "DockRoot Team",
        category: "Guides",
        tags: ["docker", "getting-started", "linux", "setup"],
        excerpt: "Everything you need to know to set up your hacking environment and run your first Docker lab.",
        readTime: "5 min",
        markdownFile: "posts/getting-started.md"
    },
    {
        id: 2,
        slug: "docker-security-fundamentals",
        title: "Docker Security: What You Need to Know",
        emoji: "🐳",
        date: "2025-02-05",
        author: "DockRoot Team",
        category: "Tutorials",
        tags: ["docker", "security", "containers", "cgroups"],
        excerpt: "A deep dive into Docker's security model — namespaces, cgroups, capabilities, and where things go wrong.",
        readTime: "10 min",
        markdownFile: "posts/docker-security.md"
    },
    {
        id: 3,
        slug: "writeup-web-sql-injection",
        title: "Writeup: SQL Injection 101 Lab",
        emoji: "🔓",
        date: "2025-03-01",
        author: "user_0x41",
        category: "Writeups",
        tags: ["writeup", "web", "sql-injection", "easy"],
        excerpt: "A complete walkthrough of the SQL Injection 101 lab — from reconnaissance to flag extraction.",
        readTime: "8 min",
        markdownFile: "posts/writeup-sql-injection.md"
    }
];

function getPostBySlug(slug) {
    return BLOG_POSTS.find(p => p.slug === slug) || null;
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
