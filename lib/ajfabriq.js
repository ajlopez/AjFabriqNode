
var net = require('net');

var EventEmitter = process.EventEmitter;

exports.createProcessor = function(name, value) {
	return new Processor(name, value);
}

function Processor(name, value)
{
	this.name = name;
	this.value = value;
	this.processors = [];
}

Processor.prototype.__proto__ = EventEmitter.prototype;

Processor.prototype.addProcessor = function (processor)
{
	this.processors.push(processor);
	processor.parent = this;
}

Processor.prototype.createProcessor = function (name, value)
{
	var processor = new Processor(name, value);
	this.addProcessor(processor);
	return processor;
}

Processor.prototype.post = function (message)
{
	if (this.name && this.value && message[this.name] == null)
		message[this.name] = this.value;
		
	if (this.parent != null) {
		this.parent.post(message);
		return;
	}
		
	this.process(message);
}

Processor.prototype.canProcess = function (message)
{
	if (this.name && this.value) {
		if (message[this.name] != this.value)
			return false;
	}
	
	if (this.processors == null || this.processors.length == 0)
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
	
	for (var processor in this.processors)
		if (this.processors[processor].canProcess(message)) 
		{
			this.processors[processor].process(message);
		}
}

Processor.prototype.getDescriptor = function ()
{
	var descriptor = { };
	
	if (this.name && this.value)
		descriptor[this.name] = this.value;
	
	if (this.processors == null || this.processors.length == 0)
		return descriptor;
		
	descriptor.processors = [];
	
	for (var processor in this.processors)
		descriptor.processors.push(this.processors[processor].getDescriptor());
		
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
	if (this.descriptor == null)
		return false;

	for (var processor in this.descriptor.processors) {
		if (canProcess(this.descriptor.processors[processor], message))
			return true;
	}
	
	return false;
		
	function canProcess(descriptor, message) {
		for (var name in descriptor) {
			if (name == 'processors')
				continue;
			
			if (message[name] == descriptor[name]) {
				if (descriptor.processors == null)
					return true;
				
				for (var processor in descriptor.processors) {
					if (canProcess(descriptor.processors[processor], message))
						return true;
				}
			}
		}
		
		return false;
	}
};

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
