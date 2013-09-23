/**
 * Author: krasu
 * Date: 9/19/13
 * Time: 5:09 PM
 */
var io
function createServer(server) {
	io = require('socket.io').listen(server);

	io.configure('production', function () {
		io.enable('browser client minification');
		io.enable('browser client etag');
		io.enable('browser client gzip');

		io.set("transports", ["xhr-polling"]);
		io.set("polling duration", 10);
	});

	io.configure('development', function () {
		io.set('transports', ['websocket']);
	});

	return io
}

module.exports = function (server) {
	return io || createServer(server)
};