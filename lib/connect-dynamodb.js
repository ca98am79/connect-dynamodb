/*!
 * Connect - DynamoDB
 * Copyright(c) 2015 Mike Carson <ca98am79@gmail.com>
 * MIT Licensed
 */
var AWS = require('aws-sdk');
var https = require('https');

var aws_options = { 
  accessKeyId : process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey : process.env.AWS_SECRET_KEY,
  region : process.env.AWS_REGION,
  httpOptions : { // fix for nodejs 4+
    agent: new https.Agent({
      rejectUnauthorized: true,
      keepAlive: true,                
      secureProtocol: "TLSv1_method"
    })
  }
};

var oneDayInMilliseconds = 24*60*60*1000; //One day in milliseconds.

module.exports = function (connect) {
  var Store = connect.session.Store;
  function DynamoDBStore(options) {
    var lambda = new AWS.Lambda(new AWS.Config(aws_options));
    options = options || {};
    Store.call(this, options);
    this.prefix = null == options.prefix ? 'sess:' : options.prefix;
    this.client = new AWS.DynamoDB(new AWS.Config(aws_options));
    this.table = options.table || 'sessions';
    this.client.describeTable({
      TableName: this.table
    }, function (error, info) {
      if (error) {
        this.client.createTable({
          TableName: this.table,
          AttributeDefinitions: [{AttributeName: 'id',AttributeType: 'S'}],
          KeySchema: [{AttributeName: 'id',KeyType: 'HASH'}],
          ProvisionedThroughput: {ReadCapacityUnits: 5,WriteCapacityUnits: 5}
        }, console.log);
      }
    }.bind(this));
  };

  DynamoDBStore.prototype.__proto__ = Store.prototype;

  DynamoDBStore.prototype.get = function (sid, fn) {
    var self = this;

    sid = this.prefix + sid;
    var now = +new Date;
    this.client.getItem({
      TableName: this.table,
      Key: {id: {'S': sid}}
    }, function (err, result) {
      if (err) {
        fn(err);
      } else {
        try {
          if (!result.Item) return fn(null, null);
          else if (result.Item.expires && now >= parseInt(result.Item.expires.N)) {
            self.destroy(result.Item.id.S);
            fn(null, null);
          } else {
            var sess = result.Item.sess.S.toString();
            sess = JSON.parse(sess);
            fn(null, sess);
          }
        } catch (err) {
          fn(err);
        }
      }
    }.bind(this));
  };

  DynamoDBStore.prototype.set = function (sid, sess, fn) {
    sid = this.prefix + sid;
    var expires = typeof sess.cookie.maxAge === 'number' ? (+new Date()) + sess.cookie.maxAge : (+new Date()) + oneDayInMilliseconds;
    sess = JSON.stringify(sess);

    var params = {
      TableName: this.table,
      Item: {
        id: {'S': sid},
        expires: {'N': JSON.stringify(expires)},
        type: {'S': 'connect-session'},
        sess: {'S': sess}
      }
    };
    this.client.putItem(params, fn);
  };

  DynamoDBStore.prototype.destroy = function (sid, fn){
    sid = this.prefix + sid;
    this.client.deleteItem({
      TableName: this.table,
      Key: {
          id: {'S': sid}
      }
    },fn || function (err){});
  };

  DynamoDBStore.prototype.reap = function (fn) { // to-do : use lambda function for this in stead of reaping
      var now = +new Date;
      var options = {
        endkey: '[' + now + ',{}]'
      };
      var params = {
        TableName: this.table,
        ScanFilter: {
          "expires": {
            "AttributeValueList": [{
              "N": now.toString()
            }],
            "ComparisonOperator": "LT"
          }
        },
        AttributesToGet: ["id"]
      };
      this.client.scan(params, function (err, data) {
        if (err) return fn && fn(err);
        destroy.call(this, data, fn);
      }.bind(this));
  };

  function destroy(data, fn) { // to-do , use batch delete
    var self = this;    
    function destroyDataAt(index) {
      if (data.Count > 0 && index < data.Count) {
        var sid = data.Items[index].id.S;
        sid = sid.substring(self.prefix.length, sid.length);
        self.destroy(sid, function () {
          destroyDataAt(index + 1);
        });
      } else {
        return fn && fn();
      }
    }
    destroyDataAt(0);
  }
  return DynamoDBStore;
};