from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

if __name__ == '__main__':
    port = 80
    print(f"Starting ThreadingHTTPServer on port {port}...")
    server = ThreadingHTTPServer(('localhost', port), SimpleHTTPRequestHandler)
    server.serve_forever()
