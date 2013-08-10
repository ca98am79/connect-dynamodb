var should = require('should'),
    connect = require('connect'),
    DynamoDBStore = require(__dirname + '/../lib/connect-dynamodb.js')(connect);

describe('DynamoDBStore', function () {
    describe('Instantiation', function () {
        it('should be able to be created', function () {
            var store = new DynamoDBStore({
                table: 'sessions-test'
            });
            store.should.be.an.instanceOf(DynamoDBStore)
        });
    });
    describe('Setting', function () {
        it('should store data correctly', function (done) {
            var store = new DynamoDBStore({
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
        before(function () {
            var store = new DynamoDBStore({
                table: 'sessions-test'
            });
            store.set('1234', {
                cookie: {
                    maxAge: 2000
                },
                name: 'tj'
            }, function () {});
        });

        it('should get data correctly', function (done) {
            var store = new DynamoDBStore({
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
    describe('Destroying', function () {
        before(function () {
            var store = new DynamoDBStore({
                table: 'sessions-test'
            });
            store.set('12345', {
                cookie: {
                    maxAge: 2000
                },
                name: 'tj'
            }, function () {});
        });

        it('should destroy data correctly', function (done) {
            var store = new DynamoDBStore({
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
            var store = new DynamoDBStore({
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