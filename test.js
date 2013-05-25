
/**
 * Module dependencies.
 */

var assert = require('assert')
, connect = require('connect')
, DynamoDBStore = require('./')(connect);

var store = new DynamoDBStore({table : 'sessions-test', reapInterval : 2000});

// #set()
store.set('1234', {
	cookie: {
		maxAge: 2000
	}, 
	name: 'tj_reap'
}, function(err, ok){
	assert.ok(!err, '#set() got an error');
	assert.ok(ok, '#set() is not ok');
});

store.set('123', {
	cookie: {
		maxAge: 2000
	}, 
	name: 'tj'
}, function(err, ok){
	assert.ok(!err, '#set() got an error');
	assert.ok(ok, '#set() is not ok');

	// #get()
	store.get('123', function(err, data){
		assert.ok(!err, '#get() got an error');
		assert.deepEqual({
			cookie: {
				maxAge: 2000
			}, 
			name: 'tj'
		}, data);

		// #destroy
		store.destroy('123', function(err, data){
			assert.ok(!err, '#destroy() got an error');

			store.get('123', function(err, data){
				assert.strictEqual(data, null, '#get() should not find destroyed key');

				// #reap()
				setTimeout(function(){
					store.get('1234', function(err, data){
						assert.strictEqual(data, null, '#get() should not find destroyed key');
						
						console.log('done');
					});
				}, 4000);
			});
		});
	})
});
