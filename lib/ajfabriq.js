
var net = require('net');

var EventEmitter = process.EventEmitter;

exports.createProcessor = function(filter) {
	return new Processor(filter);
}

function Processor(filter)
{
	this.filter = filter;
	this.processors = [];
}

Processor.prototype.__proto__ = EventEmitter.prototype;

Processor.prototype.addProcessor = function (processor)
{
	this.processors.push(processor);
	processor.parent = this;
}

Processor.prototype.createProcessor = function (filter)
{
	var processor = new Processor(filter);
	this.addProcessor(processor);
	return processor;
}

Processor.prototype.post = function (message)
{
    if (this.filter)
        for (var key in this.filter)
            if (message[key] == undefined)
                message[key] = this.filter[key];
        
	if (this.parent != null) {
		this.parent.post(message);
		return;
	}
		
	this.process(message);
}

Processor.prototype.canProcess = function (message)
{
    if (this.filter)
        for (var key in this.filter)
            if (message[key] !== this.filter[key])
                return false;
	
	if (!this.processors || !this.processors.length)
		return true;
		
	for (var processor in this.processors)
		if (this.processors[processor].canProcess(message))
			return true;
			
	return false;
}

Processor.prototype.process = function (message)
{
	if (this.processors == null || this.processors.length == 0) {
		this.emit(message.action, message);
		return;
	}
	
	for (var n in this.processors) {
        var processor = this.processors[n];
        
		if (processor.canProcess(message)) 
			processor.process(message);
    }
}

Processor.prototype.getDescriptor = function ()
{
	var descriptor = { };
	
    if (this.filter)
        descriptor.filter = this.filter;
	
	if (this.processors == null || this.processors.length == 0)
		return descriptor;
		
	descriptor.processors = [];
	
	for (var n in this.processors) {
        var processor = this.processors[n];
		descriptor.processors.push(processor.getDescriptor());
    }
		
	return descriptor;
}

exports.createLocalHost = function () {
	return new LocalHost();
}

function RemoteHost(socket, localhost) {
	this.socket = socket;
	this.localhost = localhost;
}

RemoteHost.prototype.process = function (message) {
	this.socket.post('ajfmessage', message);
};

RemoteHost.prototype.canProcess = function (message) {
	if (!this.descriptor)
		return false;

	for (var n in this.descriptor.processors) {
        var filter = this.descriptor.processors[n].filter;
        var processors = this.descriptor.processors[n].processors;
        
		if (canProcess(filter, message, processors))
			return true;
	}
	
	return false;		
};

function canProcess(filter, message, processors) {
    if (filter)
        for (var name in filter) {
            if (message[name] !== filter[name])
                return false;
        }
    
    if (!processors)
        return true;

    for (var n in processors) {
        var processor = processors[n];
        var filter = processor.filter;
        var processors = processor.processors;
        
        if (canProcess(filter, message, processors))
            return true;
    }
    
    return false;
}

function LocalHost() {
	Processor.prototype.constructor.call(this);
	
	var host = this;
	this.remotes = [];
	
	this.connect = function (channel, isserver) {
		console.log('New Connection');
		
		if (isserver) {
			channel.remote = new RemoteHost(channel, host);				
			addRemote(channel.remote);
			channel.post('ajfconnect', host.getDescriptor());
		}
				
		channel.on('ajfconnect', function(message) {
			if (channel.remote == null) {
				channel.remote = new RemoteHost(channel, host);				
				addRemote(channel.remote);
				channel.post('ajfconnect', host.getDescriptor());
			}
			
			channel.remote.descriptor = message;
		});
  
		channel.on('ajfmessage', function(message) {
			host.process(message);
		});

		channel.on('disconnect', function () {
			if (channel.remote != null) {
				removeRemote(channel.remote);				
				console.log('Remote Host Disconnected');
			}
		});
	};
	
	function addRemote(remote) {
		host.remotes.push(remote);
	}
	
	function removeRemote(remote) {
		for (var i = 0; i < host.remotes.length; i++) {
			if (host.remotes[i] == remote) {
				host.remotes.splice(i, 1);
				return;
			}
		}
	}
}

LocalHost.prototype = new Processor();
LocalHost.prototype.constructor = LocalHost;

LocalHost.prototype.listen = function(port, host) {
	var localhost = this;
	
	var server = net.createServer(function (socket) {
		localhost.connect(new Channel(socket));
	});

	server.listen(port, host);
};

LocalHost.prototype.post = function (message) {
	var hosts = [ this ];
	
	for (var remote in this.remotes) {
		if (this.remotes[remote].canProcess(message)) {
			hosts.push(this.remotes[remote]);
		}
	}

	var n = Math.floor(Math.random() * hosts.length);
	
	hosts[n].process(message);
};

function Channel(socket) {
	var events = {};
	this.socket = socket;
	
	var mythis = this;
	
	socket.on('data', function(data) {
		var text = data.toString();
		var lines = text.split("\n");
		
		for (var i in lines) {
			var line = lines[i];
			
			if (line == null || line.length <= 1)
				continue;
				
			console.log('Received', line);
			try {
				var message = JSON.parse(line);
			}
			catch(err) {
				console.log("Error in parse", err);
				return;
			}
			mythis.process(message);
		}
	});
	
	socket.on('close', function() { mythis.process({name: 'disconnect'}); });
	socket.on('error', function() { mythis.process({name: 'disconnect'}); });

	this.process = function (message) {
		if (message.name == null)
			return;
			
		this.emit(message.name, message.message);
	};
	
	this.post = function (name, message) {
		var msg = { name: name, message: message };
		var text = JSON.stringify(msg);
		console.log("Sending", text);
		this.socket.write(text+"\n");
	};
}

Channel.prototype.__proto__ = EventEmitter.prototype;

exports.Channel = Channel;
