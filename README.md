
# Connect DynamoDB

connect-dynamodb is a DynamoDB session store backed by [dynode](https://github.com/Wantworthy/dynode)

## Installation

	  $ npm install connect-dynamodb

## Options
  
  - `client` An existing dynode client object you normally get from `new (dynode.Client)({accessKeyId: "AWSAccessKey", secretAccessKey: "SecretAccessKey"});`
  - `table` DynamoDB server session table name
  - `accessKeyId` AWS accessKeyId
  - `secretAccessKey` AWS secretAccessKey
  - `prefix` Key prefix defaulting to "sess"
  - `reapInterval` How often expired sessions should be cleaned up

## Usage

    var connect = require('connect')
	 	  , DynamoDBStore = require('connect-dynamodb')(connect);
	 	  
	var store = new DynamoDBStore({
	  // Name of the table you would like to use for sessions.
	  table: 'myapp-sessions',
	
	  // AWSAccessKey
	  accessKeyId: 'AWSAccessKey',
	  
	  // AWS secretAccessKey
	  secretAccessKey: 'SecretAccessKey',
	  
	  // Optional. How often expired sessions should be cleaned up.
  	  // Defaults to 600000 (10 minutes).
  	  reapInterval: 600000
	});
	
    var server = connect.createServer();
	server.use(connect.session({secret: 'YourSecretKey', store: store });

 Or with [express](http://expressjs.com/)
 	
 	var store = new DynamoDBStore({
	  // Name of the table you would like to use for sessions.
	  table: 'myapp-sessions',
	
	  // AWSAccessKey
	  accessKeyId: 'AWSAccessKey',
	  
	  // AWS secretAccessKey
	  secretAccessKey: 'SecretAccessKey'
	});
	
    var app = express.createServer(
		  express.cookieParser()
		, express.session({ secret: 'YourSecretKey', store: store)
	  );

## TODO

Improve tests

## Contributors

Some people have have added features and fixed bugs in `connect-dynamodb` other than me.

* [Eric Abouaf](https://github.com/neyric)

Thanks!

## LICENSE - "MIT License"

Copyright (c) 2012 Mike Carson, http://ca98am79.com/

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.