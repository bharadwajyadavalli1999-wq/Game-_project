#!/usr/bin/env python3
"""
Simple local development server for Tic-Tac-Toe Deluxe.
Serves static files and opens the default web browser.
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def run():
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}"
        print(f"\n========================================================")
        print(f"  ✨ Tic-Tac-Toe Deluxe is running at:")
        print(f"  👉 {url}")
        print(f"  Press Ctrl+C to stop the server.")
        print(f"========================================================\n")
        
        try:
            webbrowser.open(url)
        except Exception:
            pass
            
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server. Goodbye!")
            httpd.shutdown()

if __name__ == '__main__':
    run()
