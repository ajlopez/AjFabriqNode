
/**
 * Module dependencies.
 */

var net = require('net'),
    ajfabriq = require('../../'),
    resolver = require('./resolver'),
    downloader = require('./downloader'),
    harvester = require('./harvester');

var host = ajfabriq.createLocalHost();

/**
 * Application configuration.
 */
 
var app = host.createProcessor({ application: 'webcrawler' });
harvester.createProcessor(app);
downloader.createProcessor(app);

var socket = new net.Socket();

socket.connect(3000, 'localhost',
	function() {
		host.connect(new ajfabriq.Channel(socket), true);
	}
);
	
