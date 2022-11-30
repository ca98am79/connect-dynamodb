/*!
 * Connect - DynamoDB
 * Copyright(c) 2020 introvert.com LLC <support@introvert.com>
 * MIT Licensed
 */
/**
 * Module dependencies.
 */
const {
  DynamoDBClient,
  DescribeTableCommand,
  CreateTableCommand,
  ScalarAttributeType,
} = require("@aws-sdk/client-dynamodb");

/**
 * One day in milliseconds.
 */
const oneDayInMilliseconds = 86400000;

/**
 * Return the `DynamoDBStore` extending `connect`'s session Store.
 *
 * @param {object} connect
 * @return {Function}
 * @api public
 */

module.exports = function (connect) {
  /**
   * Connect's Store.
   */
  const Store = connect.Store || connect.session.Store;

  /**
   * Initialize DynamoDBStore with the given `options`.
   *
   * @param {Object} options
   * @api public
   */
  function DynamoDBStore(options) {
    options = options || {};
    Store.call(this, options);
    this.initialized = false;
    this.prefix = null == options.prefix ? "sess:" : options.prefix;
    this.hashKey = null == options.hashKey ? "id" : options.hashKey;
    this.readCapacityUnits =
      null == options.readCapacityUnits
        ? 5
        : parseInt(options.readCapacityUnits, 10);
    this.writeCapacityUnits =
      null == options.writeCapacityUnits
        ? 5
        : parseInt(options.writeCapacityUnits, 10);
    this.specialKeys = null == options.specialKeys ? [] : options.specialKeys;
    this.skipThrowMissingSpecialKeys =
      null == options.skipThrowMissingSpecialKeys
        ? false
        : !!options.specialKeys;
    this.client = options.client ? options.client : new DynamoDBClient({});

    this.table = options.table || "sessions";
    this.reapInterval = options.reapInterval || 0;
    if (this.reapInterval > 0) {
      this._reap = setInterval(this.reap.bind(this), this.reapInterval);
    }

    // TODO it's problematic that this is being done through a constructor, probably better as a method precondition.
    // check if sessions table exists, otherwise create it
  }

  /*
   *  Inherit from `Store`.
   */

  DynamoDBStore.prototype.__proto__ = Store.prototype;

  /** Defines if the initialize function has been run in this instance yet or not */
  DynamoDBStore.prototype.initialized = false;

  /**
   * Verifies the sessions table exists and attempts to create if missing.
   *
   * @api public
   */
  DynamoDBStore.prototype.initialize = function () {
    if (this.initialized) {
      return Promise.resolve();
    }

    return this.client
      .send(new DescribeTableCommand({ TableName: this.table }))
      .then(() => {
        this.initialized = true;
      })
      .catch(() => {
        this.client
          .send(
            new CreateTableCommand({
              TableName: this.table,
              AttributeDefinitions: [
                {
                  AttributeName: this.hashKey,
                  AttributeType: ScalarAttributeType.S,
                },
              ],
              KeySchema: [
                {
                  AttributeName: this.hashKey,
                  KeyType: "HASH",
                },
              ],
              ProvisionedThroughput: {
                ReadCapacityUnits: this.readCapacityUnits,
                WriteCapacityUnits: this.writeCapacityUnits,
              },
            })
          )
          .then(() => {
            this.initialized = true;
          });
      });
  };

  /**
   * Attempt to fetch session by the given `sid`.
   *
   * @param {String} sid
   * @param {Function} fn
   * @api public
   */
  DynamoDBStore.prototype.get = function (sid, fn) {
    this.initialize().then(() => {
      sid = this.prefix + sid;
      const now = Math.floor(Date.now() / 1000);

      const params = {
        TableName: this.table,
        Key: {},
        ConsistentRead: true,
      };
      params.Key[this.hashKey] = {
        S: sid,
      };

      this.client.getItem(
        params,
        function (err, result) {
          if (err) {
            fn(err);
          } else {
            try {
              if (!(result.Item && result.Item.sess && result.Item.sess.S))
                return fn(null, null);
              else if (result.Item.expires && now >= +result.Item.expires.N) {
                fn(null, null);
              } else if (!result.Item.sess) {
                // Session isn't on the item for some reason. This seems to happen when
                // the session has been destroyed but Dynamo still returns an Item
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
        }.bind(this)
      );
    });
  };

  /**
   * Commit the given `sess` object associated with the given `sid`.
   *
   * @param {String} sid
   * @param {Session} sess
   * @param {Function} fn
   * @api public
   */
  DynamoDBStore.prototype.set = function (sid, sess, fn) {
    this.initialize().then(() => {
      sid = this.prefix + sid;
      const expires = this.getExpiresValue(sess);
      const sessString = JSON.stringify(sess);

      const params = {
        TableName: this.table,
        Item: {
          expires: {
            N: JSON.stringify(expires),
          },
          type: {
            S: "connect-session",
          },
          sess: {
            S: sessString,
          },
        },
      };
      params.Item[this.hashKey] = {
        S: sid,
      };

      const missingKeys = [];
      this.specialKeys.forEach((key) => {
        if (typeof sess[key.name] !== "undefined") {
          const item = {};
          item[key.type] = sess[key.name];
          params.Item[key.name] = item;
        } else {
          missingKeys.push(key.name);
        }
      });

      if (!this.skipThrowMissingSpecialKeys && missingKeys.length > 0) {
        throw Error(
          "Session missing special keys" + JSON.stringify(missingKeys)
        );
      }

      this.client.putItem(params, fn);
    });
  };

  /**
   * Cleans up expired sessions
   *
   * @param {Function} fn
   * @api public
   */
  DynamoDBStore.prototype.reap = function (fn) {
    this.initialize().then(() => {
      const now = Math.floor(Date.now() / 1000);
      const params = {
        TableName: this.table,
        ScanFilter: {
          expires: {
            AttributeValueList: [
              {
                N: now.toString(),
              },
            ],
            ComparisonOperator: "LT",
          },
        },
        AttributesToGet: [this.hashKey],
      };
      this.client.scan(
        params,
        function onScan(err, data) {
          if (err) return fn && fn(err);
          destroy.call(this, data, fn);
          if (typeof data.LastEvaluatedKey != "undefined") {
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            this.client.scan(params, onScan.bind(this));
          }
        }.bind(this)
      );
    });
  };

  function destroy(data, fn) {
    const self = this;

    function destroyDataAt(index) {
      if (
        data.Count > 0 &&
        index < data.Count &&
        data.Items &&
        data.Items[index] &&
        data.Items[index][self.hashKey]
      ) {
        var sid = data.Items[index][self.hashKey].S;
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

  /**
   * Destroy the session associated with the given `sid`.
   *
   * @param {String} sid
   * @param {Function} fn
   * @api public
   */

  DynamoDBStore.prototype.destroy = function (sid, fn) {
    this.initialize().then(() => {
      sid = this.prefix + sid;
      const params = {
        TableName: this.table,
        Key: {},
      };
      params.Key[this.hashKey] = {
        S: sid,
      };
      this.client.deleteItem(params, fn || function () {});
    });
  };

  /**
   * Calculates the expire value based on the configuration.
   * @param  {Object} sess Session object.
   * @return {Integer}      The expire on timestamp.
   */
  DynamoDBStore.prototype.getExpiresValue = function (sess) {
    const expires =
      typeof sess.cookie.maxAge === "number"
        ? +new Date() + sess.cookie.maxAge
        : +new Date() + oneDayInMilliseconds;
    return Math.floor(expires / 1000);
  };

  /**
   * Touches the session row to update it's expire value.
   * @param  {String}   sid  Session id.
   * @param  {Object}   sess Session object.
   * @param  {Function} fn   Callback.
   */
  DynamoDBStore.prototype.touch = function (sid, sess, fn) {
    this.initialize().then(() => {
      sid = this.prefix + sid;
      const expires = this.getExpiresValue(sess);
      const params = {
        TableName: this.table,
        Key: {},
        UpdateExpression: "set expires = :e",
        ExpressionAttributeValues: {
          ":e": {
            N: JSON.stringify(expires),
          },
        },
        ReturnValues: "UPDATED_NEW",
      };
      params.Key[this.hashKey] = {
        S: sid,
      };

      this.client.updateItem(params, fn || function () {});
    });
  };

  /**
   * Clear intervals
   *
   * @api public
   */

  DynamoDBStore.prototype.clearInterval = function () {
    if (this._reap) clearInterval(this._reap);
  };

  return DynamoDBStore;
};
