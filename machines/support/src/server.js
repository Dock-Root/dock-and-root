const express = require('express');
const cookieParser = require('cookie-parser');
const { exec } = require('child_process');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const LOGIN = "admin";
const PASS = "password";

app.get('/', (req, res) => {
    res.send(`
        <html><head><title>IT Support Portal</title>
        <style>body{font-family:sans-serif; padding:50px; background:#f0f0f0;}</style>
        </head><body>
        <h2>Login to Diagnostic Portal</h2>
        <form method="POST" action="/login">
            <input type="text" name="user" placeholder="Username"><br><br>
            <input type="password" name="pass" placeholder="Password"><br><br>
            <input type="submit" value="Login">
        </form>
        </body></html>
    `);
});

app.post('/login', (req, res) => {
    if (req.body.user === LOGIN && req.body.pass === PASS) {
        res.cookie('auth', 'admin');
        res.redirect('/dashboard');
    } else {
        res.send('Invalid credentials. <a href="/">Back</a>');
    }
});

app.get('/dashboard', (req, res) => {
    if (req.cookies.auth !== 'admin') return res.redirect('/');
    res.send(`
        <html><head><title>Dashboard</title>
        <style>body{font-family:sans-serif; padding:50px; background:#f0f0f0;}
        pre { background: black; color: white; padding: 15px; }
        </style></head><body>
        <h2>System Diagnostic Center</h2>
        <p>Use the tool below to list active network connections or processes.</p>
        <form method="POST" action="/diagnostics">
            <select name="action">
                <option value="netstat -ant">List Connections</option>
                <option value="ps -ef">List Processes</option>
            </select>
            <input type="submit" value="Run">
        </form>
        </body></html>
    `);
});

app.post('/diagnostics', (req, res) => {
    if (req.cookies.auth !== 'admin') return res.redirect('/');
    const action = req.body.action; // VULNERABLE: Direct command injection
    exec(action, (error, stdout, stderr) => {
        let output = stdout || stderr;
        res.send(`
            <h2>Result for: ${action}</h2>
            <pre>${output}</pre>
            <a href="/dashboard">Back</a>
        `);
    });
});

app.listen(8080, () => console.log('Support portal listening on 8080'));
