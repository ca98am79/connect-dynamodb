# Connect DynamoDB

connect-dynamodb is a DynamoDB session store backed by the [aws-sdk](https://github.com/aws/aws-sdk-js)

[![NPM](https://nodei.co/npm/connect-dynamodb.png)](https://nodei.co/npm/connect-dynamodb/)
[![NPM](https://nodei.co/npm-dl/connect-dynamodb.png)](https://nodei.co/npm-dl/connect-dynamodb/)

## Installation

	  $ npm install connect-dynamodb

## Options

  - One of the following:
    - `client` An existing AWS DynamoDB object you normally get from `new AWS.DynamoDB()`
    - `AWSConfigPath` Path to JSON document containing your [AWS credentials](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html#Credentials_from_Disk) (defaults to loading credentials from [environment variables](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html#Credentials_from_Environment_Variables)) and any additional [AWS configuration](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html) options
    - `AWSConfigJSON` JSON object containing your [AWS configuration](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html) options
  - `AWSRegion` Optional AWS region (defaults to 'us-east-1', ignored if using `AWSConfigPath` or `AWSConfigJSON`)
  - `table` Optional DynamoDB server session table name (defaults to "sessions")
  - `hashKey` Optional hash key (defaults to "id")
  - `prefix` Optional key prefix (defaults to "sess")
  - `reapInterval` Optional - how often expired sessions should be cleaned up (defaults to 600000)

## Usage

	var options = {
		// Name of the table you would like to use for sessions.
		// Defaults to 'sessions'
	  	table: 'myapp-sessions',

		// Optional path to AWS credentials (loads credentials from environment variables by default)
  	  	// AWSConfigPath: './path/to/credentials.json',

		// Optional JSON object of AWS configuration options
  	  	// AWSConfigJSON: {
  	  	//     region: 'us-east-1',
  	  	//     correctClockSkew: true
  	  	// }

	  	// Optional. How often expired sessions should be cleaned up.
  	  	// Defaults to 600000 (10 minutes).
  	  	reapInterval: 600000
	};

	var connect = require('connect'),
		DynamoDBStore = require('connect-dynamodb')(connect);
	connect()
		.use(connect.cookieParser())
		.use(connect.session({ store: new DynamoDBStore(options), secret: 'keyboard cat'}))

 Or with [express](http://expressjs.com/) 3.x.x

 	DynamoDBStore = require('connect-dynamodb')(express);
 	var app = express(
		express.cookieParser(),
		express.session({ store: new DynamoDBStore(options), secret: 'keyboard cat'})
	);

Or with [express](http://expressjs.com/) 4.x.x

 	var app = express();
 	var session = require('express-session');
 	DynamoDBStore = require('connect-dynamodb')({session: session});
 	app.use(session({ store: new DynamoDBStore(options), secret: 'keyboard cat', resave: true, saveUninitialized: true}));

## Contributors

Some people that have added features and fixed bugs in `connect-dynamodb` other than me.

* [Eric Abouaf](https://github.com/neyric)
* [James Bloomer](https://github.com/jamesbloomer)
* [Roy Lines](https://github.com/roylines)
* [B2M Development](https://github.com/b2mdevelopment)
* [Kristian Ačkar](https://github.com/kristian-ackar)
* [doapp-ryanp](https://github.com/doapp-ryanp)
* [Bryce Larson](https://github.com/bryce-larson)
* [Etienne Adriaenssen](https://github.com/etiennea)

Thanks!

## License

connect-dynamodb is licensed under the [MIT license.](https://github.com/ca98am79/connect-dynamodb/blob/master/LICENSE.txt)

## Donations

I made this in my spare time, so if you find it useful you can donate at my BTC address: `13Bzg4reJJt43wU1QsPSCzyFZMLhJbRELA`. Thank you very much!
