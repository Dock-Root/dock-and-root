from flask import Flask, request, render_template_string
import requests

app = Flask(__name__)

TEMPLATE = '''
<!DOCTYPE html>
<html>
<head>
    <title>Web Proxy Service</title>
    <style>
        body { font-family: monospace; padding: 50px; background-color: #f7f7f7; }
        .container { background-color: white; padding: 20px; border: 1px solid #ccc; max-width: 600px; margin: 0 auto; }
        input[type="text"] { padding: 10px; width: 400px; }
        input[type="submit"] { padding: 10px; background: #333; color: white; border: none; cursor: pointer; }
        .result { background: #eee; padding: 10px; margin-top: 20px; white-space: pre-wrap; word-wrap: break-word;}
    </style>
</head>
<body>
    <div class="container">
        <h2>Corporate Web Proxy</h2>
        <p>Test connectivity to external sites using our proxy service.</p>
        <form method="POST" action="/fetch">
            <input type="text" name="url" placeholder="http://example.com" value="http://example.com">
            <input type="submit" value="Fetch">
        </form>
        {% if result %}
        <div class="result">
            <h4>Response:</h4>
            <div>{{ result|safe }}</div>
        </div>
        {% endif %}
    </div>
</body>
</html>
'''

@app.route('/')
def index():
    return render_template_string(TEMPLATE)

@app.route('/fetch', methods=['POST'])
def fetch():
    url = request.form.get('url', '')
    try:
        # Vulnerable to SSRF!
        r = requests.get(url, timeout=5)
        result = r.text
    except Exception as e:
        result = "Error: Could not fetch URL."
    return render_template_string(TEMPLATE, result=result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
