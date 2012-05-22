
# Connect DynamoDB

connect-dynamodb is a DynamoDB session store backed by [dynode](https://github.com/Wantworthy/dynode)

## Installation

	  $ npm install connect-dynamodb

## Options
  
  - `client` An existing dynamodb client object you normally get from `dynamodb.createClient()`
  - `table` DynamoDB server session table
  - `accessKeyId` AWS accessKeyId
  - `secretAccessKey` AWS secretAccessKey
  - `prefix` Key prefix defaulting to "sess:"

## Usage

 Due to npm 1.x changes, we now need to pass connect to the function `connect-dynamodb` exports in order to extend `connect.session.Store`:

    var connect = require('connect')
	 	  , DynamoDBStore = require('connect-dynamodb')(connect);

    connect.createServer(
      connect.cookieParser(),
      // 5 minutes
      connect.session({ store: new DynamoDBStore, secret: 'keyboard cat' })
    );

 This means express users may do the following, since `express.session.Store` points to the `connect.session.Store` function:
 
    var DynamoDBStore = require('connect-dynamodb')(express);
