## Running without Node.js

This project can be served with Python instead of Node.js.

1. Create a virtual environment and install the Python dependencies.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Start the app.

```bash
python python_server.py
```

3. Open the app in a browser.

- Audience page: http://localhost:3000/
- Admin page: http://localhost:3000/admin.html

The Python server serves the static frontend and provides a lightweight WebSocket broadcast layer for the live audience/admin state, so you do not need Node.js to run the project locally.

