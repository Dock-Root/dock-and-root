from flask import Flask, request
import os

app = Flask(__name__)

@app.route('/admin/execute')
def execute():
    cmd = request.args.get('cmd', '')
    if not cmd:
        return "Internal Diagnostic Server: Please provide a 'cmd' parameter to execute system diagnostics."
    try:
        # Run command server-side
        result = os.popen(cmd).read()
    except Exception as e:
        result = str(e)
    return f"<pre>{result}</pre>"

if __name__ == '__main__':
    # Only listen on localhost
    app.run(host='127.0.0.1', port=8080)
