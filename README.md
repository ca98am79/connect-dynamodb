# Connect DynamoDB

connect-dynamodb is a DynamoDB session store backed by the [2.x aws-sdk](https://github.com/aws/aws-sdk-js)

## Installation

    $ npm install connect-dynamodb

## Options

Rational defaults are set but can be overridden in the options object. Credentials and configuration are automatically loaded from [environment variables](http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html) or [shared credentials](http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-shared.html) but may optionally be passed through a JSON file or object. The client attribute is necessary for use with [DynamoDB Local](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) but can be left out if using DynamoDB with your AWS account.  To use [DynamoDB TTL](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html), enable it on the table and select the `expires` field.

  - One of the following if not using environment variables or shared credentials:
    - `AWSConfigPath` Optional path to a [file containing your AWS credentials and configuration](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html#Credentials_from_Disk)
    - `AWSConfigJSON` Optional [JSON object containing your AWS credentials and configuration](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html)
  - `client` Optional AWS DynamoDB object from `new AWS.DynamoDB()`
  - `AWSRegion` Optional AWS region (defaults to 'us-east-1', ignored if using `AWSConfigPath` or `AWSConfigJSON`)
  - `table` Optional DynamoDB server session table name (defaults to "sessions")
  - `hashKey` Optional hash key (defaults to "id")
  - `prefix` Optional key prefix (defaults to "sess")
  - `reapInterval` Legacy session expiration cleanup in milliseconds.  Should instead enable [DynamoDB TTL](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html) and select the `expires` field.  **BREAKING CHANGE** from v1.0.11 to v2.0.0 for reaping sessions with changes to the format of the expires field timestamp.

## Usage

    var options = {
        // Optional DynamoDB table name, defaults to 'sessions'
        table: 'myapp-sessions',

        // Optional path to AWS credentials and configuration file
        // AWSConfigPath: './path/to/credentials.json',

        // Optional JSON object of AWS credentials and configuration
        AWSConfigJSON: {
            accessKeyId: <YOUR_ACCESS_KEY_ID>,
            secretAccessKey: <YOUR_SECRET_ACCESS_KEY>,
            region: 'us-east-1'
        },

        // Optional client for alternate endpoint, such as DynamoDB Local
        client: new AWS.DynamoDB({ endpoint: new AWS.Endpoint('http://localhost:8000')}),

        // Optional ProvisionedThroughput params, defaults to 5
        readCapacityUnits: 25,
        writeCapacityUnits: 25,

        // Optional special keys that will be inserted directly into your table (in addition to remaining in the session)
        specialKeys: [
            {
                name: 'userId', // The session key
                type: 'S' // The DyanamoDB attribute type
            }
        ],
        // Optional skip throw missing special keys in session, if set true
        skipThrowMissingSpecialKeys: true,
    };

With [connect](https://github.com/senchalabs/connect)

    var connect = require('connect');
    var DynamoDBStore = require('connect-dynamodb')(connect);
    connect()
        .use(connect.cookieParser())
        .use(connect.session({ store: new DynamoDBStore(options), secret: 'keyboard cat'}));

With [express 3](http://expressjs.com/en/3x/api.html)

    var DynamoDBStore = require('connect-dynamodb')(express);
    var app = express(
        express.cookieParser(),
        express.session({ store: new DynamoDBStore(options), secret: 'keyboard cat'});
    );

With [express 4](http://expressjs.com/)

    var app = express();
    var session = require('express-session');
    var DynamoDBStore = require('connect-dynamodb')({session: session});
    app.use(session({store: new DynamoDBStore(options), secret: 'keyboard cat'}));

OR

    var app = express();
    var session = require('express-session');
    var DynamoDBStore = require('connect-dynamodb')(session);
    app.use(session({store: new DynamoDBStore(options), secret: 'keyboard cat'}));

## Testing

If you want to run the tests locally and have the AWS environment variables setup you can run the command:

```
npm test
```

You can also run it locally by running the following two scripts in separate terminals:

```
docker run -it --rm \
  --name=dynamodb-test \
  -p 127.0.0.1:8000:8000 \
  deangiberson/aws-dynamodb-local
```

```
export AWS_CONFIG_JSON='{"endpoint": "http://127.0.0.1:8000", "region": "us-east-1", "accessKeyId": "accesskey", "secretAccessKey": "secretaccesskey"}'
npm test
```

## IAM Permissions
Connect DynamoDB requires the following IAM permissions for DynamoDB:
- CreateTable
- PutItem
- DeleteItem
- GetItem
- Scan
- UpdateItem

Sample IAM policy (with least privilege):

_(Replace __\<AWS ACCOUNT ID\>__, __\<TABLE NAME\>__ and __\<SOURCE IP AND BITMASK\>__)._

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "dynamodb:CreateTable",
                "dynamodb:DescribeTable",
                "dynamodb:PutItem",
                "dynamodb:DeleteItem",
                "dynamodb:GetItem",
                "dynamodb:Scan",
                "dynamodb:UpdateItem"
            ],
            "Resource": "arn:aws:dynamodb:*:<AWS ACCOUNT ID>:table/<TABLE NAME>"
        }
    ]
}
```

## License

connect-dynamodb is licensed under the [MIT license.](https://github.com/ca98am79/connect-dynamodb/blob/master/LICENSE.txt)

## Donations

I made this in my spare time, so if you find it useful you can donate at my BTC address: `35dwLrmKHjCgGXyLzBSd6YaTgoXQA17Aoq`. Thank you very much!
