#!/usr/bin/env python3
import http.server
import socketserver
import sys
import os

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
DIRECTORY = sys.argv[2] if len(sys.argv) > 2 else os.getcwd()

FAVICON = (
    b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x10'
    b'\x00\x00\x00\x10\x08\x02\x00\x00\x00\x90\x91h6\x00\x00'
    b'\x00\x18IDAT\x08\xd7c\xfc\xff\xff?\x03\x00\x08\xfc\x02'
    b'\xfe\xa7\x9a\xa0\xa0\x00\x00\x00\x00IEND\xaeB`\x82'
)

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        if self.path == '/favicon.ico':
            self.send_response(200)
            self.send_header('Content-Type', 'image/png')
            self.send_header('Content-Length', str(len(FAVICON)))
            self.end_headers()
            self.wfile.write(FAVICON)
            return
        super().do_GET()

    def handle(self):
        try:
            super().handle()
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass

    def log_error(self, format, *args):
        msg = format % args if args else format
        if any(x in str(msg) for x in ("Broken pipe", "Connection reset", "Connection aborted")):
            return
        super().log_error(format, *args)

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

if __name__ == "__main__":
    with ReusableTCPServer(("", PORT), QuietHandler) as httpd:
        print(f"Serving {DIRECTORY}")
        print(f"  → http://localhost:{PORT}")
        print("Press Ctrl+C to stop.\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")
            sys.exit(0)
