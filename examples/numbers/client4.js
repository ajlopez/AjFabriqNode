
net = require('net');

var socket = new net.Socket();

socket.connect(3000, 'localhost',
function() {
	socket.write(JSON.stringify({name : 'ajfmessage', message: { application: 'numbers', node: 'processor', action: 'decrement', number: 10 }}),
	function () { process.exit(0); }
);
});

