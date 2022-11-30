const should = require("should"),
  session = require("express-session"),
  sinon = require("sinon");
const {
  DynamoDBClient,
  CreateTableCommand,
  DeleteTableCommand,
  ScalarAttributeType,
} = require("@aws-sdk/client-dynamodb");
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
  const store = new DynamoDBStore({
    client: client,
    table: "sessions-test",
  });
  const sessionId = Math.random().toString();

  describe("Instantiation", () => {
    it("should be able to be created", () => {
      store.should.be.an.instanceOf(DynamoDBStore);
    });

    it("should accept a client as an option", (done) => {
      const hostname = "localhost";
      const port = 23431;
      const protocol = "http";
      const endpoint = `${protocol}://${hostname}:${port}`;
      const store = new DynamoDBStore({
        client: new DynamoDBClient({ endpoint }),
        table: "sessions-test",
      });
      store.should.be.an.instanceOf(DynamoDBStore);
      store.client.config
        .endpoint()
        .then((clientEndpoint) => {
          clientEndpoint.hostname.should.equal(hostname);
          clientEndpoint.port.should.equal(port);
          clientEndpoint.protocol.should.equal(protocol);
        })
        .finally(done);
    });
  });

  describe("Initializing", () => {
    describe("creating a table", () => {
      const tableName = "sessions-test-" + Math.random().toString();
      const store = new DynamoDBStore({
        client,
        table: tableName,
      });
      const describeSessionsTableSpy = sinon.spy(
        store,
        "describeSessionsTable"
      );
      const createSessionsTableSpy = sinon.spy(store, "createSessionsTable");

      it("Should create the table if it doesn't exist and skip subsequent calls", async () => {
        describeSessionsTableSpy.notCalled.should.equal(true);
        createSessionsTableSpy.notCalled.should.equal(true);
        await store.initialize();
        describeSessionsTableSpy.calledOnce.should.equal(true);
        createSessionsTableSpy.calledOnce.should.equal(true);
        await store.initialize();
        describeSessionsTableSpy.calledOnce.should.equal(true);
        createSessionsTableSpy.calledOnce.should.equal(true);
      });

      after(async () => {
        await client.send(new DeleteTableCommand({ TableName: tableName }));
      });
    });

    describe("using an existing table", () => {
      const tableName = "sessions-test-" + Math.random().toString();
      const store = new DynamoDBStore({
        client,
        table: tableName,
      });
      const describeSessionsTableSpy = sinon.spy(
        store,
        "describeSessionsTable"
      );
      const createSessionsTableSpy = sinon.spy(store, "createSessionsTable");

      before(async () => {
        const hashKey = "id";
        await client.send(
          new CreateTableCommand({
            TableName: tableName,
            AttributeDefinitions: [
              {
                AttributeName: hashKey,
                AttributeType: ScalarAttributeType.S,
              },
            ],
            KeySchema: [
              {
                AttributeName: hashKey,
                KeyType: "HASH",
              },
            ],
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5,
            },
          })
        );
      });

      it("should not call the create table function", async () => {
        describeSessionsTableSpy.notCalled.should.equal(true);
        createSessionsTableSpy.notCalled.should.equal(true);
        await store.initialize();
        describeSessionsTableSpy.calledOnce.should.equal(true);
        createSessionsTableSpy.notCalled.should.equal(true);
      });

      after(async () => {
        await client.send(new DeleteTableCommand({ TableName: tableName }));
      });
    });
  });

  describe("Setting", () => {
    it("should store data correctly", (done) => {
      const name = Math.random().toString();

      store.set(
        sessionId,
        {
          cookie: {
            maxAge: 2000,
          },
          name,
        },
        (err) => {
          if (err) throw err;

          done();
        }
      );
    });
  });

  describe("Getting", () => {
    const sandbox = sinon.createSandbox();
    const name = Math.random().toString();

    before((done) => {
      store.set(
        sessionId,
        {
          cookie: {
            maxAge: 2000,
          },
          name,
        },
        done
      );
    });

    after((done) => {
      sandbox.restore();
      done();
    });

    it("should get data correctly", (done) => {
      store.get(sessionId, function (err, res) {
        if (err) throw err;
        res.cookie.should.eql({ maxAge: 2000 });
        res.name.should.eql(name);

        done();
      });
    });

    it("does not crash on invalid session object", (done) => {
      // TODO I need to understand this test better to update it
      sandbox.stub(store.client, "getItem").callsArgWith(1, null, {
        Item: {},
      });

      store.get(sessionId + "-not-real", function (err, res) {
        if (err) throw err;
        should.not.exist(res);

        done();
      });
    });
  });

  describe("Touching", () => {
    const name = Math.random().toString();
    const sess = {
      cookie: {
        maxAge: 2000,
      },
      name,
    };
    let maxAge = null;

    before((done) => {
      maxAge = Math.floor((Date.now() + 2000) / 1000);
      store.set(sessionId, sess, done);
    });

    it("should touch data correctly", (done) => {
      this.timeout(4000);

      setTimeout(() => {
        store.touch(sessionId, sess, function (err, res) {
          if (err) throw err;
          const expires = res.Attributes.expires.N;
          expires.should.be.above(maxAge);
          (expires - maxAge).should.be.aboveOrEqual(1);
          done();
        });
      }, 1510);
    });
  });

  describe("Destroying", () => {
    // We'll use a new session id here to avoid affecting the other tests
    const sessionId = Math.random().toString();
    const name = Math.random().toString();

    before((done) => {
      store.set(
        sessionId,
        {
          cookie: {
            maxAge: 2000,
          },
          name,
        },
        done
      );
    });

    it("should destroy data correctly", (done) => {
      store.destroy(sessionId, function (err) {
        if (err) throw err;

        store.get(sessionId, function (err, res) {
          if (err) throw err;
          should.not.exist(res);

          done();
        });
      });
    });
  });

  describe("Reaping", () => {
    // We'll use a new session id here to avoid affecting the other tests
    const sessionId = Math.random().toString();
    const name = Math.random().toString();

    before((done) => {
      store.set(
        sessionId,
        {
          cookie: {
            maxAge: -20000,
          },
          name,
        },
        done
      );
    });

    it("should reap data correctly", (done) => {
      this.timeout(5000); // increased timeout for local dynamo
      store.reap(function (err) {
        if (err) throw err;

        store.get(sessionId, function (err, res) {
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
