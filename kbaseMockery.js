/* jslint white:true */
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
 * next up:
 * - programmatically load configuration for services at load time.
 */

// Init some requirements.
var KBaseStubby = require('./lib/stubbyStarter');
var MockServer = require('./lib/mockServer');
var MockConfigParser = require('./lib/mockConfigParser');
var iniParser = require('node-ini');

// Get the global config.
const CONFIG_FILE = 'deploy.cfg';
var cfg = iniParser.parseSync(CONFIG_FILE)['kbase-mockery'];

// Parse the given mockup config files.
var mockConfigParser = new MockConfigParser();
var stubbyConfig = [];
for (var i=2; i<process.argv.length; i++) {
    stubbyConfig = stubbyConfig.concat(mockConfigParser.parseFile(process.argv[i]));
}


var stubConfig = {
    stubs: cfg.STUBBY_PORT,
    admin: cfg.STUBBY_ADMIN_PORT,
    location: 'localhost',
    data: stubbyConfig
};
// add in all requests from files.
KBaseStubby.startStubby(stubConfig);
var server = new MockServer(cfg);
server.start();