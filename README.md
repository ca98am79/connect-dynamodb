
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
