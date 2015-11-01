# kbase-mockery
A Stubby-based service for mocking JSON-RPC calls in KBase. See also https://github.com/mrak/stubby4node.

This works by wrapping a Stubby server behind a small NodeJS server. The Node server changes the KBase JSON-RPC into something a little more lightweight that Stubby can deal with. This also lets us modify the mock config files to be a little more expressive. For example, the "port" property in request should just be a regex that defines the parameters - it doesn't have to deal with the entire JSON document.

More details to come...

##Installation
(requires nodejs)
```
npm install
```

##Starting up the mock server
```
node kbaseMockery.js mock_config_1.yml mock_config_2.yml ...
```
A couple tiny example configs are given in workspace_mock.yml and narrative_mock.yml

##Using it
Get the server up and running (run the above node command) and try running these parameters through cURL - that's a standard KBase JSON-RPC to get the Workspace version.

```
curl -d '{"method":"Workspace.ver", "version":"1.1", "id":"12345", "params":[]}' -X POST http://localhost:8080/services/ws
```

##Tweaking it
`deploy.cfg` in the root has the port endpoints. 

##To Do
* Handle auth headers for calls that require them.
* Format responses the way KBase calls get formatted.
* Format errors as expected.
* Autogenerate some calls (or build the skeleton of a Stubby YAML) based on KIDL typespecs.