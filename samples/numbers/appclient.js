
net = require('net');
var ajfabriq = require('../../');

var host = ajfabriq.createLocalHost();

/**
 * Application configuration.
 */
 
var app = host.createProcessor({ application: 'numbers' });
var node = app.createProcessor({ node: 'processor' });

node.on('decrement', function (message) {
	console.log("Processing number " + message.number);
	if (message.number <= 1)
		return;
		
	var number = message.number-1;
	
	this.post({ action: 'decrement', number: number });
});

var socket = new net.Socket();

socket.connect(3000, 'localhost',
	function() {
		host.connect(new ajfabriq.Channel(socket), true);
		socket.write(JSON.stringify({name : 'ajfmessage', message: { application: 'numbers', node: 'processor', action: 'decrement', number: 10 }}));
	}
);
	
