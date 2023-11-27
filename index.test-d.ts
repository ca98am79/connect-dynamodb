import { expectType } from "tsd";

import connectDynamoDB, {
  DynamoDBStore,
  DynamoDBStoreOptions,
  DynamoDBStoreOptionsSpecialKey,
} from ".";
import expressSession from "express-session";
import express from "express";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

expectType<DynamoDBStore>(connectDynamoDB(expressSession));
expectType<connectDynamoDB.DynamoDBStore>(connectDynamoDB(expressSession));

type SessionData = {
  name: string;
  animal: "cow" | "pig";
};
const DynamoDBStore: DynamoDBStore =
  connectDynamoDB<SessionData>(expressSession);

const specialKeysOption: DynamoDBStoreOptionsSpecialKey = {
  name: "userId",
  type: "S",
};
const specialKeysOptions: connectDynamoDB.DynamoDBStoreOptionsSpecialKey[] = [
  specialKeysOption,
];
const options: DynamoDBStoreOptions = {
  table: "myapp-sessions",
  client: new DynamoDBClient({ endpoint: "http://localhost:8000" }),
  readCapacityUnits: 25,
  writeCapacityUnits: 25,
  specialKeys: specialKeysOptions,
  skipThrowMissingSpecialKeys: true,
  initialized: true,
};

expectType<express.RequestHandler>(
  expressSession({ store: new DynamoDBStore(), secret: "keyboard cat" })
);
expectType<express.RequestHandler>(
  expressSession({
    store: new DynamoDBStore({ table: "myapp-sessions" }),
    secret: "keyboard cat",
  })
);
expectType<express.RequestHandler>(
  expressSession({
    store: new DynamoDBStore(options),
    secret: "keyboard cat",
  })
);
