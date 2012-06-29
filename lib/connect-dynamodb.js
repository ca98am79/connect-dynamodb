/*!
 * Connect - DynamoDB
 * Copyright(c) 2012 Mike Carson <ca98am79@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var dynode = require('dynode');

/**
 * One day in seconds.
 */

var oneDay = 86400;

/**
 * Return the `DynamoDBStore` extending `connect`'s session Store.
 *
 * @param {object} connect
 * @return {Function}
 * @api public
 */

module.exports = function(connect){

    /**
   * Connect's Store.
   */

    var Store = connect.session.Store;

    /**
   * Initialize DynamoDBStore with the given `options`.
   *
   * @param {Object} options
   * @api public
   */

    function DynamoDBStore(options) {
        options = options || {};
        Store.call(this, options);
        this.prefix = null == options.prefix
        ? 'sess:'
        : options.prefix;

        this.client = options.client || new (dynode.Client)({
            https: true,
            accessKeyId: options.accessKeyId,
            secretAccessKey: options.secretAccessKey
        });
        
        this.table = options.table || 'sessions';
        this.reapInterval = options.reapInterval || (10 * 60 * 1000);
        if (this.reapInterval > 0) {
            this._reap = setInterval(this.reap.bind(this), this.reapInterval);
        }
        
        // check if table exists, otherwise create it
        var client = this.client;
        client.describeTable(options.table, function (error, info) {
        	if (error) {
        		client.createTable(options.table, console.log);
        	}
        });
    };

    /**
   * Inherit from `Store`.
   */

    DynamoDBStore.prototype.__proto__ = Store.prototype;

    /**
   * Attempt to fetch session by the given `sid`.
   *
   * @param {String} sid
   * @param {Function} fn
   * @api public
   */

    DynamoDBStore.prototype.get = function(sid, fn){
        sid = this.prefix + sid;
        var now = +new Date;
        this.client.getItem(this.table, sid, function(err, data){
            try {
                if (!data) return fn(null, null);
                else if (data.expires && now >= data.expires) {
                    fn(null, null);
                } else {
                    var sess = data.sess.toString();
                    sess = JSON.parse(sess);
                    fn(null, sess);
                }
            } catch (err) {
                fn(err);
            }
        }.bind(this));
    };

    /**
   * Commit the given `sess` object associated with the given `sid`.
   *
   * @param {String} sid
   * @param {Session} sess
   * @param {Function} fn
   * @api public
   */

    DynamoDBStore.prototype.set = function(sid, sess, fn){
        sid = this.prefix + sid;
        try {
            this.client.getItem(this.table, sid, function(err, data){
                var expires = typeof sess.cookie.maxAge === 'number'
                ? (+new Date()) + sess.cookie.maxAge
                : (+new Date()) + oneDay;
                sess = JSON.stringify(sess);
                if (err) {
                    data = {
                        id: sid,
                        expires: expires,
                        type: 'connect-session',
                        sess: sess
                    };
                    this.client.putItem(this.table, data, fn);
                } else {
                    if (data) {
                        data.expires = expires;
                        data.sess = sess;
                        delete data.id;
                        this.client.updateItem(this.table, sid, data, fn);
                    } else {
                        data = {
                            id: sid,
                            expires: expires,
                            type: 'connect-session',
                            sess: sess
                        };
                        this.client.putItem(this.table, data, fn);
                    }
                }
            }.bind(this));
        } catch (err) {
            fn && fn(err);
        }
    };

    /**
   * Cleans up expired sessions
   *
   * @api public
   */
    DynamoDBStore.prototype.reap = function (fn) {
        var now = +new Date;
        var options = {
            endkey: '[' + now + ',{}]'
        };
        var opts = {
            ScanFilter : {
                "expires":{
                    "AttributeValueList":[{
                        "N":now.toString()
                        }],
                    "ComparisonOperator":"LT"
                }
            },
        AttributesToGet : ["id"]
    };
    this.client.scan(this.table, opts, function (err, data) {
        if (err) return fn && fn(err);
        destroy.call(this, data, fn);
    }.bind(this));
};

function destroy(data, fn) {
    var self = this;
    function destroyDataAt(index) {
        if (index === data.length) {
            return fn && fn();
        } else {
            var sid = data[index].id;
            sid = sid.substring(self.prefix.length, sid.length);
            self.destroy(sid, function() {
                destroyDataAt(index+1);
            });
        }
    }
    destroyDataAt(0);
}

/**
   * Destroy the session associated with the given `sid`.
   *
   * @param {String} sid
   * @api public
   */
DynamoDBStore.prototype.destroy = function(sid, fn){
    sid = this.prefix + sid;
    this.client.deleteItem(this.table, sid, fn || function(){});
};

/**
   * Clear intervals
   *
   * @param {String} sid
   * @api public
   */
DynamoDBStore.prototype.clearInterval = function () {
    if (this._reap) clearInterval(this._reap);
};

return DynamoDBStore;
};