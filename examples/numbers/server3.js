
var net = require('net');
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

var server = net.createServer(function (socket) {
	host.connect(new ajfabriq.Socket(socket));
});

server.listen(3000, 'localhost');