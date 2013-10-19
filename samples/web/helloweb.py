
import http

def say_hello(request, response):
    response.end("<h1>Hello, world</h1>")

server = http.createServer(say_hello)

server.listen(3000)

