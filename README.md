# Connect DynamoDB

connect-dynamodb is a DynamoDB session store backed by the [aws-sdk](https://github.com/aws/aws-sdk-js)

## Installation

	  $ npm install connect-dynamodb

## Options
  
  - `client` An existing AWS DynamoDB object you normally get from `new AWS.DynamoDB()`
  - `AWSConfigPath` Optional path to JSON document containing your [AWS credentials](http://docs.aws.amazon.com/nodejs/latest/dg/configuration-guide.html#nodejs-dg-credentials-from-disk) (defaults to loading credentials from [environment variables](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html#Credentials_from_Environment_Variables))
  - `AWSRegion` Optional AWS region (defaults to 'us-east-1')
  - `table` Optional DynamoDB server session table name (defaults to "sessions")
  - `prefix` Optional key prefix (defaults to "sess")
  - `reapInterval` Optional - how often expired sessions should be cleaned up (defaults to 600000)

## Usage

	var options = {
		// Name of the table you would like to use for sessions.
		// Defaults to 'sessions'
	  	table: 'myapp-sessions',
	
		// Optional path to AWS credentials (loads credentials from environment variables by default)
  	  	// AWSConfigPath: './path/to/credentials.json',
	  
	  	// Optional. How often expired sessions should be cleaned up.
  	  	// Defaults to 600000 (10 minutes).
  	  	reapInterval: 600000
	};
	
	var connect = require('connect'),
		DynamoDBStore = require('connect-dynamodb')(connect);
	connect()
		.use(connect.cookieParser())
		.use(connect.session({ store: new DynamoDBStore(options), secret: 'keyboard cat'}))

 Or with [express](http://expressjs.com/)
 	
 	DynamoDBStore = require('connect-dynamodb')(express);
 	var app = express(
		express.cookieParser(), 
		express.session({ store: new DynamoDBStore(options), secret: 'keyboard cat'})
	);

## Contributors

Some people that have added features and fixed bugs in `connect-dynamodb` other than me.

* [Eric Abouaf](https://github.com/neyric)
* [James Bloomer](https://github.com/jamesbloomer)
* [Roy Lines](https://github.com/roylines)
* [B2M Development](https://github.com/b2mdevelopment)
* [Kristian Ačkar](https://github.com/kristian-ackar)
* [doapp-ryanp](https://github.com/doapp-ryanp)

Thanks!

## LICENSE - "MIT License"

Copyright (c) 2014 Mike Carson, http://ca98am79.com/

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
