var should = require('should'),
    session = require('express-session'),
    DynamoDBStore = require(__dirname + '/../lib/connect-dynamodb.js')({session: session});

var client;
if (process.env.AWS_CONFIG_JSON) {
    var AWS = require('aws-sdk');
    var config = JSON.parse(process.env.AWS_CONFIG_JSON);
    client = new AWS.DynamoDB(config);
}

describe('DynamoDBStore', function () {
    describe('Instantiation', function () {
        it('should be able to be created', function () {
            var store = new DynamoDBStore({
                client: client,
                table: 'sessions-test'
            });
            store.should.be.an.instanceOf(DynamoDBStore)
        });
    });
    describe('Setting', function () {
        it('should store data correctly', function (done) {
            var store = new DynamoDBStore({
                client: client,
                table: 'sessions-test'
            });

            store.set('123', {
                cookie: {
                    maxAge: 2000
                },
                name: 'tj'
            }, function (err, res) {
                if (err) throw err;

                done();
            });
        });

    });
    describe('Getting', function () {
        before(function (done) {
            var store = new DynamoDBStore({
                client: client,
                table: 'sessions-test'
            });
            store.set('1234', {
                cookie: {
                    maxAge: 2000
                },
                name: 'tj'
            }, done);
        });

        it('should get data correctly', function (done) {
            var store = new DynamoDBStore({
                client: client,
                table: 'sessions-test'
            });
            store.get('1234', function (err, res) {
                if (err) throw err;
                res.cookie.should.eql({
                    maxAge: 2000
                });
                res.name.should.eql('tj');

                done();
            });
        });

    });
    describe('Touching', function () {
        var sess = {
            cookie: {
                maxAge: 2000
            },
            name: 'tj'
        };
        var maxAge = null;
        before(function (done) {
            var store = new DynamoDBStore({
                client: client,
                table: 'sessions-test'
            });

            maxAge = (Math.floor((Date.now() + 2000) / 1000) );
            store.set('1234', sess, done);
        });

        it('should touch data correctly', function (done) {
            this.timeout(4000);
            var store = new DynamoDBStore({
                client: client,
                table: 'sessions-test'
            });
            setTimeout(function() {
              store.touch('1234', sess, function (err, res) {
                  if (err) throw err;
                  var expires = res.Attributes.expires.N;
                  expires.should.be.above(maxAge);
                  (expires - maxAge).should.be.aboveOrEqual(1);
                  done();
              });
            }, 1510);
        });

    });
    describe('Destroying', function () {
        before(function (done) {
            var store = new DynamoDBStore({
                client: client,
                table: 'sessions-test'
            });
            store.set('12345', {
                cookie: {
                    maxAge: 2000
                },
                name: 'tj'
            }, done);
        });

        it('should destroy data correctly', function (done) {
            var store = new DynamoDBStore({
                client: client,
                table: 'sessions-test'
            });
            store.destroy('12345', function (err, res) {
                if (err) throw err;

                store.get('12345', function (err, res) {
                    if (err) throw err;
                    should.not.exist(res);

                    done();
                });
            });
        });

    });
    describe('Reaping', function () {
        before(function (done) {
            var store = new DynamoDBStore({
                client: client,
                table: 'sessions-test'
            });
            store.set('123456', {
                cookie: {
                    maxAge: -20000
                },
                name: 'tj'
            }, done);
        });

        it('should reap data correctly', function (done) {
            this.timeout(5000); // increased timeout for local dynamo
            var store = new DynamoDBStore({
                client: client,
                table: 'sessions-test'
            });
            store.reap(function (err, res) {
                if (err) throw err;

                store.get('123456', function (err, res) {
                    if (err) throw err;
                    should.not.exist(res);

                    done();
                });
            });
        });

    });
});
