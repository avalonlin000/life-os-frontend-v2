import http.client
import http.server
import os
import sys
import traceback

port = int(sys.argv[1]) if len(sys.argv) > 1 else 3001
dist = os.path.join(os.path.dirname(__file__), "dist")
api_host = "127.0.0.1"
api_port = int(os.getenv("JIEYI_API_PORT", "8881"))

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=dist, **kwargs)

    def _strip_jieyi_prefix(self):
        if self.path == "/jieyi":
            self.path = "/"
        elif self.path.startswith("/jieyi/"):
            self.path = self.path[len("/jieyi"):]

    def _proxy_api(self):
        conn = http.client.HTTPConnection(api_host, api_port, timeout=30)
        try:
            length = int(self.headers.get("Content-Length") or 0)
            body = self.rfile.read(length) if length else None
            headers = {key: value for key, value in self.headers.items() if key.lower() != "host"}
            conn.request(self.command, self.path, body=body, headers=headers)
            res = conn.getresponse()
            data = res.read()
            self.send_response(res.status, res.reason)
            for key, value in res.getheaders():
                if key.lower() not in {"transfer-encoding", "connection"}:
                    self.send_header(key, value)
            self.end_headers()
            self.wfile.write(data)
        finally:
            conn.close()

    def _serve_spa_get_or_head(self):
        self._strip_jieyi_prefix()
        path = self.translate_path(self.path)
        _, ext = os.path.splitext(self.path)
        if not os.path.exists(path) and not ext:
            self.path = "/index.html"
        return super().do_HEAD() if self.command == "HEAD" else super().do_GET()

    def do_HEAD(self):
        if self.path.startswith("/api/"):
            return self._proxy_api()
        return self._serve_spa_get_or_head()

    def do_GET(self):
        if self.path.startswith("/api/"):
            return self._proxy_api()
        return self._serve_spa_get_or_head()

    def do_POST(self):
        if self.path.startswith("/api/"):
            return self._proxy_api()
        self.send_error(405)

    def do_PUT(self):
        if self.path.startswith("/api/"):
            return self._proxy_api()
        self.send_error(405)

    def do_PATCH(self):
        if self.path.startswith("/api/"):
            return self._proxy_api()
        self.send_error(405)

    def do_DELETE(self):
        if self.path.startswith("/api/"):
            return self._proxy_api()
        self.send_error(405)

httpd = http.server.ThreadingHTTPServer(("0.0.0.0", port), SPAHandler)
print(f"Serving {dist} on port {port} (SPA /jieyi + /api proxy to {api_host}:{api_port})")
httpd.serve_forever()
