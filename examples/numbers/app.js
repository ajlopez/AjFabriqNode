
/**
 * Module dependencies.
 */

var ajf = require('ajfabriq');

/**
 * Host.
 */

var host = ajf.createHost();

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
	
	this.parent.parent.process(message);
}

host.process({ application: 'numbers', node: 'processor', action: 'decrement', number: 10 });

