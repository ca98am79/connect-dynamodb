# Connect DynamoDB

connect-dynamodb is a DynamoDB session store backed by the [3.x @aws-sdk/client-dynamodb](https://www.npmjs.com/package/@aws-sdk/client-dynamodb).

## Installation

    $ npm install connect-dynamodb

## Options

Rational defaults are set but can be overridden in the options object.
Credentials and configuration are automatically loaded using [AWS defaults](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials.html)
unless the `client` options is provided to override them.

- `client` Optional AWS `DynamoDBClient` object from `new DynamoDBClient({})`
  If supplied, this is used instead of standard node defaults.
- `table` Optional DynamoDB server session table name (defaults to "sessions")
- `hashKey` Optional hash key (defaults to "id")
- `prefix` Optional key prefix (defaults to "sess")
- `reapInterval` Legacy session expiration cleanup in milliseconds.
  ☣️ Legacy reap behaviors use DynamoDB [`scan`](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/classes/scancommand.html)
  functionality that can incur significant costs. Should instead enable [DynamoDB TTL](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html)
  and select the `expires` field. TODO should we just remove it since we're already making a breaking change?

## Usage

```js
var options = {
  // Optional DynamoDB table name, defaults to 'sessions'
  table: "myapp-sessions",
  // Optional client for alternate endpoint, such as DynamoDB Local
  client: new DynamoDBClient({ endpoint: "http://localhost:8000" }),
  // Optional ProvisionedThroughput params, defaults to 5
  readCapacityUnits: 25,
  writeCapacityUnits: 25,
  // Optional special keys that will be inserted directly into your table (in addition to remaining in the session)
  specialKeys: [
    {
      name: "userId", // The session key
      type: "S", // The DyanamoDB attribute type
    },
  ],
  // Optional skip throw missing special keys in session, if set true
  skipThrowMissingSpecialKeys: true,
};
```

With [connect](https://github.com/senchalabs/connect)

```js
var connect = require("connect");
var DynamoDBStore = require("connect-dynamodb")(connect);
connect()
  .use(connect.cookieParser())
  .use(
    connect.session({
      store: new DynamoDBStore(options),
      secret: "keyboard cat",
    })
  );
```

With [express 3](http://expressjs.com/en/3x/api.html)

```js
var DynamoDBStore = require("connect-dynamodb")(express);
var app = express(
  express.cookieParser(),
  express.session({ store: new DynamoDBStore(options), secret: "keyboard cat" })
);
```

With [express 4](http://expressjs.com/)

```js
var app = express();
var session = require("express-session");
var DynamoDBStore = require("connect-dynamodb")({ session: session });
app.use(session({ store: new DynamoDBStore(options), secret: "keyboard cat" }));
```

OR

```js
var app = express();
var session = require("express-session");
var DynamoDBStore = require("connect-dynamodb")(session);
app.use(session({ store: new DynamoDBStore(options), secret: "keyboard cat" }));
```

## Testing

If you want to run the tests locally and have the AWS environment variables setup you can run the command:

```bash
npm test
```

You can also run it locally by running the following two scripts in separate terminals:

```bash
docker run -it --rm \
  --name=dynamodb-test \
  -p 127.0.0.1:8000:8000 \
  deangiberson/aws-dynamodb-local
```

```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=accesskey
export AWS_SECRET_ACCESS_KEY=secretaccesskey
export ENDPOINT=http://127.0.0.1:8000
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

_(Replace **\<AWS ACCOUNT ID\>**, **\<TABLE NAME\>** and **\<SOURCE IP AND BITMASK\>**)._

```json
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
