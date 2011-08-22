
var readline = require('readline');

exports.createHost = function() {
	return new Host();
}

exports.createLocalHost = function (socket) {
	return new LocalHost(socket);
}

function Host() {
	this.applications = { };
}

Host.prototype.process = function (message) {
	this.applications[message.application].process(message);
};

Host.prototype.post = function (message) {
	this.process(message);
};

Host.prototype.createApplication = function (appname) {
	var newapp = new Application(this, appname);
	this.applications[appname] = newapp;
	return newapp;
}

function RemoteHost(socket, localhost) {
	this.socket = socket;
	this.localhost = localhost;
	this.applications = { };
	var remote = this;
	
	socket.on('ajfapplication', function(appname) {
		remote.localhost.registerApplication(appname, remote.socket);
	});
}

RemoteHost.prototype.process = function (message) {
	this.socket.emit('ajfmessage', message);
};

RemoteHost.prototype.registerApplication = function (appname) {
	if (this.applications[appname] == null)
		this.applications[appname] = { nodes: {} };
};

RemoteHost.prototype.registerNode = function (appname, nodename) {
	this.registerApplication(appname);
	if (this.applications[appname].nodes[nodename] == null)
		this.applications[appname].nodes[nodename] = {};
};

function LocalHost() {
	Host.prototype.constructor.call(this);
	
	var host = this;
	this.remotes = [];
	this.remoteApplications = { };
	
	this.connect = function (socket, isserver) {
		console.log('New Connection');
		
		if (isserver) {
			socket.remote = new RemoteHost(socket, host);				
			addRemote(socket.remote);
			socket.emit('ajfconnect');
			sendApplicationsAndNodes(socket);
		}
				
		socket.on('ajfconnect', function(message) {
			socket.remote = new RemoteHost(socket, host);				
			addRemote(socket.remote);
			sendApplicationsAndNodes(socket);
		});
		
		socket.on('ajfapplication', function (message) {
			console.log('Registering Remote Application', message.application);
			socket.remote.registerApplication(message.application);
		});
  
		socket.on('ajfnode', function (message) {
			console.log('Registering Remote Node', message);
			socket.remote.registerNode(message.application, message.node);
		});
  
		socket.on('ajfmessage', function(message) {
			console.log('Message received', JSON.stringify(message));
			host.process(message);
		});

		socket.on('disconnect', function () {
			if (socket.remote != null) {
				removeRemote(socket.remote);				
				console.log('Remote Host Disconnected');
			}
		});
	};
	
	function addRemote(remote) {
		host.remotes.push(remote);
	}
	
	function removeRemote(remote) {
		for (var i = 0; i < host.remotes.lenght; i++) {
			if (host.remotes[i] == remote) {
				host.remotes.splice(i, 1);
				return;
			}
		}
	}
	
	function sendApplicationsAndNodes(socket)
	{
		for (var appname in host.applications) {
			socket.emit('ajfapplication', { application : appname });
			for (var nodename in host[appname]) {
				socket.emit('ajfnode', { application: appname, node: nodename });
			}
		}
	}
}

LocalHost.prototype = new Host();
LocalHost.prototype.constructor = LocalHost;

LocalHost.prototype.registerApplication = function (appname) {
	if (this.remoteApplications[appname] == null)
		this.remoteApplications[appname] = { nodes: {} };
};

LocalHost.prototype.registerNode = function (appname, nodename) {
	this.registerApplication(appname);
	if (this.remoteApplications[appname].nodes[nodename] == null)
		this.remoteApplications[appname].nodes[nodename] = {};
};

function Application(host, appname) {
	this.parent = host;
	this.name = appname;
	this.nodes = {};
}

Application.prototype.createNode = function (nodename) {
	var newnode = new Node(this, nodename);
	this.nodes[nodename] = newnode;
	return newnode;
}

Application.prototype.process = function (message) {
	this.nodes[message.node].process(message);
};

function Node(application, nodename) {
	this.parent = application;
	this.name = nodename;
}

Node.prototype.process = function (message) {
	this[message.action](message);
};

function Socket(socket) {
	var events = {};
	this.socket = socket;
	
	var mythis = this;
	
	//var rl = readline.createInterface(socket, socket);
/*	
	rl.on('data', function(data) {
		var text = data.toString();
		console.log('Received', text);
		var message = JSON.parse(text);
		mythis.process(message);
	});
*/
	
	socket.on('data', function(data) {
		var text = data.toString();
		var lines = text.split("\n");
		
		for (var i in lines) {
			var line = lines[i];
			console.log('Received', line);
			try {
				var message = JSON.parse(line);
			}
			catch(err) {
				console.log("Error in parse", err);
			}
			mythis.process(message);
		}
	});
	
	socket.on('close', function() { mythis.process({name: 'disconnect'}); });
	socket.on('error', function() { mythis.process({name: 'disconnect'}); });
	
	this.on = function (name, fn) {
		events[name] = fn;
	};
	
	this.process = function (message) {
		if (message.name == null)
			return;
			
		if (events[message.name] == null)
			return;
			
		events[message.name](message.message);
	}
	
	this.emit = function (name, message) {
		var msg = { name: name, message: message };
		var text = JSON.stringify(msg);
		console.log("Sending", text);
		this.socket.write(text+"\r\n");
	};
}

exports.Socket = Socket;
