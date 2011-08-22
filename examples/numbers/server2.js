
net = require('net');

var server = net.createServer(function (socket) {
	console.log('New connection');
	socket.write('Hi, client!', 'utf8');
});

server.listen(3000, 'localhost');