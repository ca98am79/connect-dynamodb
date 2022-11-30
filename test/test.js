const should = require("should"),
  session = require("express-session"),
  sinon = require("sinon");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const ConnectDynamoDB = require(__dirname + "/../lib/connect-dynamodb.js");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  // deangiberson/aws-dynamodb-local uses http://127.0.0.1:8000
  // LocalStack uses http://localhost:4566
  endpoint: process.env.ENDPOINT,
  // These are automatically loaded in DynamoDBClient if the env below are specified.
  // credentials: {
  //   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  // },
});

describe("ConnectDynamoDB", () => {
  describe("Constructor", () => {
    it("should take session as argument", () => {
      const StoreConstructor = ConnectDynamoDB(session);
      expectDynamoDBStore(StoreConstructor);
    });

    it("should take session as one of the options", () => {
      const StoreConstructor = ConnectDynamoDB({ session: session });
      expectDynamoDBStore(StoreConstructor);
    });
  });
});

describe("DynamoDBStore", () => {
  const DynamoDBStore = ConnectDynamoDB({ session });

  describe("Instantiation", () => {
    it("should be able to be created", () => {
      var store = new DynamoDBStore({
        client: client,
        table: "sessions-test",
      });
      store.should.be.an.instanceOf(DynamoDBStore);
    });

    it("should accept a client as an option", () => {
      const endpoint = "http://localhost:23431";
      var store = new DynamoDBStore({
        client: new DynamoDBClient({ endpoint }),
        table: "sessions-test",
      });
      store.should.be.an.instanceOf(DynamoDBStore);
      store.client.endpoint.should.equal(endpoint);
    });
  });

  describe("Setting", () => {
    it("should store data correctly", function (done) {
      var store = new DynamoDBStore({
        client: client,
        table: "sessions-test",
      });

      store.set(
        "123",
        {
          cookie: {
            maxAge: 2000,
          },
          name: "tj",
        },
        function (err) {
          if (err) throw err;

          done();
        }
      );
    });
  });
  describe("Getting", () => {
    let sandbox = sinon.createSandbox();

    before(function (done) {
      var store = new DynamoDBStore({
        client: client,
        table: "sessions-test",
      });
      store.set(
        "1234",
        {
          cookie: {
            maxAge: 2000,
          },
          name: "tj",
        },
        done
      );
    });

    after(function (done) {
      sandbox.restore();
      done();
    });

    it("should get data correctly", function (done) {
      var store = new DynamoDBStore({
        client: client,
        table: "sessions-test",
      });
      store.get("1234", function (err, res) {
        if (err) throw err;
        res.cookie.should.eql({
          maxAge: 2000,
        });
        res.name.should.eql("tj");

        done();
      });
    });

    it("does not crash on invalid session object", function (done) {
      var store = new DynamoDBStore({
        client: client,
        table: "sessions-test",
      });

      sandbox.stub(store.client, "getItem").callsArgWith(1, null, {
        Item: {},
      });

      store.get("9876", function (err, res) {
        if (err) throw err;
        should.not.exist(res);

        done();
      });
    });
  });
  describe("Touching", () => {
    var sess = {
      cookie: {
        maxAge: 2000,
      },
      name: "tj",
    };
    var maxAge = null;
    before(function (done) {
      var store = new DynamoDBStore({
        client: client,
        table: "sessions-test",
      });

      maxAge = Math.floor((Date.now() + 2000) / 1000);
      store.set("1234", sess, done);
    });

    it("should touch data correctly", function (done) {
      this.timeout(4000);
      var store = new DynamoDBStore({
        client: client,
        table: "sessions-test",
      });
      setTimeout(() => {
        store.touch("1234", sess, function (err, res) {
          if (err) throw err;
          var expires = res.Attributes.expires.N;
          expires.should.be.above(maxAge);
          (expires - maxAge).should.be.aboveOrEqual(1);
          done();
        });
      }, 1510);
    });
  });
  describe("Destroying", () => {
    before(function (done) {
      var store = new DynamoDBStore({
        client: client,
        table: "sessions-test",
      });
      store.set(
        "12345",
        {
          cookie: {
            maxAge: 2000,
          },
          name: "tj",
        },
        done
      );
    });

    it("should destroy data correctly", function (done) {
      var store = new DynamoDBStore({
        client: client,
        table: "sessions-test",
      });
      store.destroy("12345", function (err) {
        if (err) throw err;

        store.get("12345", function (err, res) {
          if (err) throw err;
          should.not.exist(res);

          done();
        });
      });
    });
  });
  describe("Reaping", () => {
    before(function (done) {
      var store = new DynamoDBStore({
        client: client,
        table: "sessions-test",
      });
      store.set(
        "123456",
        {
          cookie: {
            maxAge: -20000,
          },
          name: "tj",
        },
        done
      );
    });

    it("should reap data correctly", function (done) {
      this.timeout(5000); // increased timeout for local dynamo
      var store = new DynamoDBStore({
        client: client,
        table: "sessions-test",
      });
      store.reap(function (err) {
        if (err) throw err;

        store.get("123456", function (err, res) {
          if (err) throw err;
          should.not.exist(res);

          done();
        });
      });
    });
  });
});

const expectDynamoDBStore = (DynamoDBStore) => {
  DynamoDBStore.should.be.an.instanceOf(Function);
  const store = new DynamoDBStore({ table: "sessions-test" });
  store.should.be.an.instanceOf(DynamoDBStore);
  store.client.should.be.instanceOf(DynamoDBClient);
};
