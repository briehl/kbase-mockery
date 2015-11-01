var Stubby = require('Stubby').Stubby;

function startStubby(config) {
    'use strict';
    var stubby = new Stubby();
    config.data = [
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
    ];
    stubby.start(config);
    return stubby;
}

module.exports = {
    startStubby: startStubby
};