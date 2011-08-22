
net = require('net');

var socket = net.createConnection(3000);

socket.write('Hi, server');

socket.on('data', function(data) {
	console.log(data.toString('utf8'));
});