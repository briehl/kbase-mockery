var http = require('http');
var request = require('request');

var MockServer = function(config) {
    var handleRequest = function (req, response) {
        'use strict';
        var fullBody = "";
        if (req.method === 'POST') {
            console.log('Got a POST request.');

            req.on('data', function(chunk) {
                console.log("here's a chunk.");
                console.log(chunk.toString());
                fullBody += chunk.toString();
            });

            req.on('end', function() {
                console.log('Passing this along to Stubby:');
                var jsonCall = {};
                try {
                    jsonCall = JSON.parse(fullBody);
                    console.log(jsonCall);
                }
                catch(error) {
                    response.writeHead(500, "Internal server error", {'Content-Type': 'text/html'});
                    response.end('Data is invalid JSON: ' + error);
                    return;
                }

                request({
                    method: 'POST',
                    uri: 'http://localhost:' + config.STUBBY_PORT + req.url,
                    multipart: [
                    {  
                        'content-type': 'application/json',
                        'body': '{"method":"' + jsonCall.method + '","params":' + JSON.stringify(jsonCall.params) + '}'
                    }
                    ]
                },
                function(error, stubRes, body) {
                    if (!error) {
                        // response.writeHead(stubRes.statusCode);
                        console.log('got back from stubby: ' + body);
                        response.end(body);
                    }
                });
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