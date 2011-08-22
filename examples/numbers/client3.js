
net = require('net');

var socket = net.createConnection(3000);

var ajfabriq = require('ajfabriq');

var host = ajfabriq.createLocalHost();

/**
 * Application configuration.
 */
 
var app = host.createApplication('numbers');
var node = app.createNode('processor');
node.decrement = function (message) {
	console.log("Processing number " + message.number);
	if (message.number <= 1)
		return;
		
	message.number--;
	
	this.parent.parent.post(message);
}

host.connect(new ajfabriq.Socket(socket), true);

socket.write(JSON.stringify({name : 'ajfmessage', message: { application: 'numbers', node: 'processor', action: 'decrement', number: 10 }}));

socket.on('data', function(data) {
	console.log(data.toString('utf8'));
});