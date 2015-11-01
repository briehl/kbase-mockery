var YAML = require('yamljs');
var extend = require('extend');

var MockConfigParser = function () {
    'use strict';
    var parseFile = function (file) {
        var config = YAML.load(file);
        /*
         * now the fun part. need this structure by the end (for each endpoint)
         *
         * {
             request: {
                method: POST (if there's no method given)
                url: mainUrl/service-name.service-method
                post: '' or the given regex... maybe sort the keys later?
             }
             response: {
                status: 200 (or overriding value)
                headers: {
                    'Content-Type': 'application/json'
                },
                body: "The response"
             }
            }
          */
        var mainUrl = config['main-url'];
        var serviceName = config['service-name'];
        var endpoints = config['endpoints'];
        if (!mainUrl || !serviceName) {
            throw "Need a main url and service name!";
        }
        var configuredEndpoints = [];
        for (var i=0; i<endpoints.length; i++) {
            var end = endpoints[i];
            if (!(end.request && end.response))
                throw "Need a request and response for each endpoint!";
            var request = {
                method: end.request.method ? end.request.method : 'POST',
                url: mainUrl + '/' + serviceName + '.' + end.request['service-method'],
                post: end.request.post ? end.request.post : ''
            };
            extend(request, end.request);

            var response = {
                headers: {
                    "content-type": "application/json"
                }
            };
            extend(response, end.response);
            configuredEndpoints.push({request: request, response: response});
        }
        return configuredEndpoints;
    };

    return {
        parseFile: parseFile
    };
};

module.exports = MockConfigParser;