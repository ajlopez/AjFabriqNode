
/**
 * Module dependencies.
 */

var sio = require('socket.io');

var client = require('socket.io-client-ws');

//sio.listen(3001);

var socket = client.connect('http://localhost:8080', { transports: ['websocket'], debug: true });
socket.emit('joinGame', 'gameid');
//socket.emit('ajfmessage', { application: 'numbers', node: 'processor', action: 'decrement', number: 20 });
console.log('Message sent');