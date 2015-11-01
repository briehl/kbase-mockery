'use strict';
/**
 * A little wrapper around Stubby that helps with JSON-RPC
 * calls made in KBase.
 *
 * These calls (those made with the Type Compiler, at least)
 * are of the form:
 *
 * {"version":"1.1", "id":"12345", "method":"Service.Method", "params":[]}
 *
 * where "version" and "id" are used internally (version describes the JSON-RPC
 * version, and id just identifies the call). What we really care about
 * mocking are the responses to the method and params. Either way, Stubby
 * is largely built around responding to reasonably simple string inputs 
 * (for POST requests, at least), and just applies a regex to them first.
 *
 * This is lacking for many reasons, not the least of which is that the 
 * stringification of a JSON doc makes no guarantees about order, so 
 * the regex gets tricky.
 *
 * So, this is a little node server that wraps requests to Stubby. 
 * Just make your request here, and the main server extracts the POSTed data,
 * formats it for friendliness to Stubby, then passes it along.
 *
 * For example, a POST to:
 * https://localhost:port/services/ws
 * with data
 * {"version":"1.1", "id":"12345", "method":"Workspace.ver", "params":[]}
 *
 * gets parsed and made into the STRING (not JSON):
 * {"method":"Workspace.ver"}
 *
 * which makes life easier for Service authors to build up Stubs for Stubby.
 *
 * TODO: 
 * - programmatically load configuration for services at load time.
 */

var Stubby = require('stubby').Stubby;
var http = require('http');
var request = require('request');

const EXTERN_PORT = 8080;
const STUBBY_PORT = 8000;
const STUBBY_ADMIN_PORT = 8100;

var stubby = new Stubby();

function handleRequest(req, response) {
    var fullBody = "";
    if (req.method === 'POST') {
        console.log('Got a POST request.');

        req.on('data', function(chunk) {
            console.log("here's a chunk.");
            console.log(chunk.toString());
            fullBody += chunk.toString();
        });

        req.on('end', function() {
            // response.writeHead(200, "OK", {'Content-Type': 'text/html'});
            // response.end();
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
                uri: 'http://localhost:' + STUBBY_PORT + req.url,
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

var server = http.createServer(handleRequest);

server.listen(EXTERN_PORT, function() {
    console.log('Server listening on http://localhost:%s', EXTERN_PORT);
});


stubby.start({
    stubs: STUBBY_PORT,
    admin: STUBBY_ADMIN_PORT,
    location: 'localhost',
    data: [
        {
            request: {
                url: '/services/ws',
                method: 'POST',
                post: '^\{"method":"Workspace.ver","params":(.+)\}'
            },
            response: {
                status: 200,
                headers: {
                    'content-type': 'application/json',
                    server: 'stubbedServer/4.2'
                },
                body: "{ a: 1, b: 2 }"
            }
        },
        {
            request: {
                url: '/services/ws',
                method: 'GET'
            },
            response: {
                status: 200,
                body: 'get outta town!'
            }
        },
        {
            request: {
                url: '/services/ws',
                method: 'POST'
            },
            response: {
                status: 500,
                body: 'No method given, or unknown method'
            }
        }
    ]
});
console.log('Stubby server started');