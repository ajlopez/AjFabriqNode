
/**
 * Module dependencies.
 */

var ajfabriq = require('../../'),
    resolver = require('./resolver'),
    downloader = require('./downloader'),
    harvester = require('./harvester');

/**
 * Host.
 */

var host = ajfabriq.createLocalHost();

/**
 * Application configuration.
 */
 
var link = process.argv[2];

var app = host.createProcessor({ application: 'webcrawler' });
resolver.createProcessor(app, link);
harvester.createProcessor(app);
downloader.createProcessor(app);

host.listen(3000);

host.process({ application: 'webcrawler', action: 'resolve', link: link });
