var http = require('http');
var request = require('request');

var MockServer = function(config) {
    var handleRequest = function (req, response) {
        'use strict';
        var fullBody = "";
        if (req.method === 'POST') {
            req.on('data', function(chunk) {
                fullBody += chunk.toString();
            });

            req.on('end', function() {
                try {
                    var jsonCall = JSON.parse(fullBody);
                    if (!jsonCall.method) {
                        throw "No method found";
                    }

                    request({
                        method: 'POST',
                        uri: 'http://localhost:' + config.STUBBY_PORT + req.url + '/' + jsonCall.method,
                        multipart: [{  
                            'content-type': 'application/json',
                            'body': JSON.stringify(jsonCall.params)
                        }]
                    },
                    function(error, stubRes, body) {
                        if (!error) {
                            console.log('got back from stubby: ' + body);
                            response.end(body);
                        }
                    });
                }
                catch(error) {
                    response.writeHead(500, "Internal server error", {'Content-Type': 'text/html'});
                    response.end('Data is invalid JSON: ' + error);
                    return;
                }
            });
        }
        else {
            response.end('It works! Woot. ' + req.url);
            console.log(req.headers);
        }
    }

    var startServer = function() {
        var server = http.createServer(handleRequest);

        server.listen(config.PORT, function() {
            'use strict';
            console.log('Server listening on http://localhost:%s', config.PORT);
        });

        return server;
    }

    return {
        start: startServer
    };
};

module.exports = MockServer;