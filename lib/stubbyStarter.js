var Stubby = require('Stubby').Stubby;

function startStubby(config) {
    'use strict';
    var stubby = new Stubby();
    stubby.start(config);
    return stubby;
}

module.exports = {
    startStubby: startStubby
};