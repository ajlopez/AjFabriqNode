
/**
 * Module dependencies.
 */

var net = require('net');
var ajfabriq = require('ajfabriq');

/**
 * Host.
 */

var host = ajfabriq.createLocalHost();

/**
 * Application configuration.
 */
 
var app = host.createProcessor('numbers', 'application');
var node = app.createProcessor('processor', 'node');
node.decrement = function (message) {
	console.log("Processing number " + message.number);
	if (message.number <= 1)
		return;
		
	var number = message.number-1;
	
	this.post({ action: 'decrement', number: number });
}

var server = net.createServer(function (socket) {
	host.connect(new ajfabriq.Socket(socket));
});

server.listen(3000, 'localhost');

host.process({ application: 'numbers', node: 'processor', action: 'decrement', number: 10 });
