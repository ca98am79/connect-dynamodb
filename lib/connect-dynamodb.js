/*!
 * Connect - DynamoDB
 * Copyright(c) 2013 Mike Carson <ca98am79@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var AWS = require('aws-sdk');

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
        
		if (options.client) {
			this.client = options.client;
		} else {
			AWS.config.loadFromPath(options.AWSConfigPath);
			this.client = new AWS.DynamoDB().client;
		}
        
		this.table = options.table || 'sessions';
		this.reapInterval = options.reapInterval || (10 * 60 * 1000);
		if (this.reapInterval > 0) {
			this._reap = setInterval(this.reap.bind(this), this.reapInterval);
		}
        
		// check if sessions table exists, otherwise create it
		var client = this.client;
		client.describeTable({
			TableName: options.table
			}, function (error, info) {
			if (error) {
				client.createTable({
					TableName: options.table, 
					KeySchema: {
						HashKeyElement: {
							AttributeName: 'id',
							AttributeType: 'S'
						}
					}, 
					ProvisionedThroughput: {
						ReadCapacityUnits: 5,
						WriteCapacityUnits: 5
					}
				}, console.log);
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
		
		this.client.getItem({
			TableName : this.table,
			Key : {
				HashKeyElement: { 'S' : sid }
			}
		}, function(err, result){
			try {
				if (!result.Item) return fn(null, null);
				else if (result.Item.expires && now >= result.Item.expires) {
					fn(null, null);
				} else {
					var sess = result.Item.sess.S.toString();
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
		var expires = typeof sess.cookie.maxAge === 'number'
		? (+new Date()) + sess.cookie.maxAge
		: (+new Date()) + oneDay;
		sess = JSON.stringify(sess);
		
		var params = {
			TableName : this.table,
			Item : {
				id: { 'S' : sid },
				expires: { 'S' : JSON.stringify(expires) },
				type: { 'S' : 'connect-session' },
				sess: { 'S' : sess }
			}
		};
		this.client.putItem(params, fn);
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
		var params = {
			TableName : this.table,
			ScanFilter : {
				"expires":{
					"AttributeValueList": [{
						"N" : now.toString()
					}],
					"ComparisonOperator":"LT"
				}
			},
			AttributesToGet : ["id"]
		};
		this.client.scan(params, function (err, data) {
			if (err) return fn && fn(err);
			destroy.call(this, data, fn);
		}.bind(this));
	};

	function destroy(data, fn) {
		var self = this;
		function destroyDataAt(index) {
			if (data.Count > 0) {
				var sid = data.Items[index].id.S;
				sid = sid.substring(self.prefix.length, sid.length);
				self.destroy(sid, function() {
					destroyDataAt(index+1);
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
   * @api public
   */
	DynamoDBStore.prototype.destroy = function(sid, fn){
		sid = this.prefix + sid;
		this.client.deleteItem({
			TableName : this.table,
			Key : {
				HashKeyElement: { 'S' : sid }
			}
		}, fn || function(){});
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