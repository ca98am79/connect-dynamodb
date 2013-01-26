
/**
 * Module dependencies.
 */

var assert = require('assert')
, connect = require('connect')
, DynamoDBStore = require('./')(connect);

var store = new DynamoDBStore({table : 'sessions-test'});

// #set()
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

		// #set null
		store.set('123', {
			cookie: {
				maxAge: 2000
			}, 
			name: 'tj'
		}, function(){
			store.destroy('123', function(){
				store.get('123', function(err, data){
					assert.ok(err, '#get() should not find destroyed key');
					console.log('done');
				});
			});
		});
	})
});
