
# Connect DynamoDB

connect-dynamodb is a DynamoDB session store backed by [dynode](https://github.com/Wantworthy/dynode)

## Installation

	  $ npm install connect-dynamodb

## Options
  
  - `client` An existing dynamodb client object you normally get from `dynamodb.createClient()`
  - `table` DynamoDB server session table
  - `accessKeyId` AWS accessKeyId
  - `secretAccessKey` AWS secretAccessKey
  - `prefix` Key prefix defaulting to "sess"

## Usage

    var connect = require('connect')
	 	  , DynamoDBStore = require('connect-dynamodb')(connect);
	 	  
	var store = new DynamoDBStore({
	  // Name of the table you would like to use for sessions.
	  table: 'myapp-sessions',
	
	  // AWSAccessKey
	  accessKeyId: 'my-aws-key',
	  
	  // AWS secretAccessKey
	  secretAccessKey: 'my-secret-aws-key'
	});
	
    var server = connect.createServer();
	server.use(connect.session({secret: 'YourSecretKey', store: store });

 Or with [express](http://expressjs.com/)
 	
 	var store = new DynamoDBStore({
	  // Name of the table you would like to use for sessions.
	  table: 'myapp-sessions',
	
	  // AWSAccessKey
	  accessKeyId: 'my-aws-key',
	  
	  // AWS secretAccessKey
	  secretAccessKey: 'my-secret-aws-key'
	});
	
    var app = express.createServer(
		  express.cookieParser()
		, express.session({ secret: 'YourSecretKey', store: store)
	  );
