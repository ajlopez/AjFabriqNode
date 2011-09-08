
/**
 * Module dependencies.
 */

var ajf = require('ajfabriq');

/**
 * Host.
 */

var host = ajf.createProcessor();

/**
 * Application configuration.
 */
 
var app = host.createProcessor('numbers', 'application');
var node = app.createProcessor('processor', 'node');
node.on('decrement', function (message) {
	console.log("Processing number " + message.number);
	
	if (message.number <= 1) {
		console.log("End Processing");
		return;
		}
		
	var number = message.number-1;
	
	this.post({ action: 'decrement', number: number });
});

host.process({ application: 'numbers', node: 'processor', action: 'decrement', number: 10 });

