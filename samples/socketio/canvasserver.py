socketio = require('socket.io')

io = socketio.listen(3000)

def on_connection(socket):
    def on_send_message(msg):
        nonlocal socket
        socket.broadcast.emit('newMessage', msg)
        console.log('Sending message', msg)

    def on_disconnect():
        console.log('user disconnected')

    socket.on('sendMessage', on_send_message)
    socket.on('disconnect', on_disconnect)

io.sockets.on('connection', on_connection)

