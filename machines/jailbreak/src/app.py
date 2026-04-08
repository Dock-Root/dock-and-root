from flask import Flask, request, render_template_string
import os

app = Flask(__name__)

TEMPLATE = '''
<!DOCTYPE html>
<html>
<head>
    <title>Jailbreak - Network Diagnostic Tool</title>
    <style>
        body { font-family: monospace; background-color: #111; color: #0f0; margin: 50px; }
        input[type="text"] { background-color: #222; color: #0f0; border: 1px solid #0f0; padding: 5px; width: 300px; }
        input[type="submit"] { background-color: #0f0; color: #111; border: none; padding: 5px 15px; cursor: pointer; }
        pre { background-color: #222; padding: 15px; border: 1px solid #333; }
        .footer { margin-top: 50px; font-size: 0.8em; color: #555; }
    </style>
</head>
<body>
    <h1>Network Diagnostic Tool v1.0</h1>
    <p>Ping a device on our network to check its status. For internal use only.</p>
    <form method="POST" action="/ping">
        <input type="text" name="ip" placeholder="127.0.0.1" value="127.0.0.1">
        <input type="submit" value="Ping!">
    </form>
    {% if result %}
    <br>
    <h3>Result:</h3>
    <pre>{{ result }}</pre>
    {% endif %}
    <div class="footer">Diagnostics daemon running as {{ user }}.</div>
</body>
</html>
'''

@app.route('/')
def index():
    user = os.popen('whoami').read().strip()
    return render_template_string(TEMPLATE, user=user)

@app.route('/ping', methods=['POST'])
def ping():
    ip = request.form.get('ip', '127.0.0.1')
    # Vulnerable to command injection!
    cmd = f"ping -c 1 {ip}"
    try:
        result = os.popen(cmd).read()
    except Exception as e:
        result = str(e)
    user = os.popen('whoami').read().strip()
    return render_template_string(TEMPLATE, result=result, user=user)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
