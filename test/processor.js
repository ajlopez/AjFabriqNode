
var ajfabriq = require('../lib/ajfabriq.js');

exports['Create Simple Processor'] = function(test) {
	var processor = ajfabriq.createProcessor();
	
	test.ok(processor.canProcess({}));
	test.ok(processor.canProcess({ application: 'foo' }));
	
	test.done();
};

exports['Create Simple Processor for Application'] = function(test) {
	var processor = ajfabriq.createProcessor({ application: 'webcrawler' });
	
	test.equal(processor.canProcess({}), false);
	test.equal(processor.canProcess({ application: 'foo' }), false);
	test.ok(processor.canProcess({ application: 'webcrawler' }));
	
	test.done();
};

exports['Process Simple Action'] = function(test) {
	var processor = ajfabriq.createProcessor({ application: 'webcrawler' });
    var message = { application: 'webcrawler', action: 'harvest', url: 'http://www.google.com' };
    
    test.expect(5);
    test.ok(processor.canProcess(message));

    processor.on('harvest', function(msg) {
        test.ok(msg);
        test.equal(msg.application, 'webcrawler');
        test.equal(msg.action, 'harvest');
        test.equal(msg.url, 'http://www.google.com');
        test.done();
    });
    
    processor.process(message);
};

exports['Process Action in Child Process'] = function(test) {
	var processor = ajfabriq.createProcessor({ application: 'webcrawler' });
    var child = processor.createProcessor({ node: 'harvester' });
    var message = { application: 'webcrawler', node: 'harvester', action: 'harvest', url: 'http://www.google.com' };
    
    test.expect(5);
    test.ok(processor.canProcess(message));

    child.on('harvest', function(msg) {
        test.ok(msg);
        test.equal(msg.application, 'webcrawler');
        test.equal(msg.action, 'harvest');
        test.equal(msg.url, 'http://www.google.com');
        test.done();
    });
    
    processor.process(message);
};

exports['Get Descriptor from Simple Processor'] = function(test) {
	var processor = ajfabriq.createProcessor({ application: 'webcrawler' });
    var descriptor = processor.getDescriptor();
    
    test.ok(descriptor);
    test.ok(descriptor.filter);
    test.ok(descriptor.filter.application);
    test.equal(descriptor.filter.application, 'webcrawler');
    test.equal(descriptor.processors, undefined);
    test.done();
};

exports['Get Descriptor from Processor with Child'] = function(test) {
	var processor = ajfabriq.createProcessor({ application: 'webcrawler' });
    var child = processor.createProcessor({ node: 'harvester' });
    var descriptor = processor.getDescriptor();
    
    test.ok(descriptor);
    test.ok(descriptor.filter);
    test.ok(descriptor.filter.application);
    test.equal(descriptor.filter.application, 'webcrawler');
    test.ok(descriptor.processors);
    test.equal(descriptor.processors.length, 1);
    
    var childdescriptor = descriptor.processors[0];
    
    test.ok(childdescriptor);
    test.ok(childdescriptor.filter);
    test.ok(childdescriptor.filter.node);
    test.equal(childdescriptor.filter.node, 'harvester');
    test.equal(childdescriptor.processors, undefined);
    
    test.done();
};
