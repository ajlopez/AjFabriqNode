
/**
 * Module dependencies.
 */

var sio = require('socket.io');

var ajf = require('ajfabriq');

/**
 * Host.
 */

var host = ajf.createLocalHost(sio.listen(3000));

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

host.process({ application: 'numbers', node: 'processor', action: 'decrement', number: 10 });

