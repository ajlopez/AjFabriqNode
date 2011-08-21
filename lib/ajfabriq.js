
exports.createHost = function() {
	return new Host();
}

function Host() {
}

Host.prototype.process = function (message) {
	this[message.application].process(message);
};

Host.prototype.createApplication = function (appname) {
	var newapp = new Application(this, appname);
	this[appname] = newapp;
	return newapp;
}

function Application(host, appname) {
	this.parent = host;
	this.name = appname;
}

Application.prototype.createNode = function (nodename) {
	var newnode = new Node(this, nodename);
	this[nodename] = newnode;
	return newnode;
}

Application.prototype.process = function (message) {
	this[message.node].process(message);
};

function Node(application, nodename) {
	this.parent = application;
	this.name = nodename;
}

Node.prototype.process = function (message) {
	this[message.action](message);
};

