import session, { Store } from "express-session";
import {
  DynamoDBClient,
  GetItemCommandOutput,
  ProvisionedThroughput,
  ScalarAttributeType,
} from "@aws-sdk/client-dynamodb";

declare function ConnectDynamoDB<Session extends Record<string, unknown>>(
  connect: typeof session
): DynamoDBStore<Session>;
export default ConnectDynamoDB;

export interface DynamoDBStoreOptions {
  /** A preconfigured client. If not supplied standard SDK environmental variables will be used. */
  client?: DynamoDBClient;
  /** Defaults to 'sessions' */
  table?: string;
  /** Defaults to 'sess:' */
  prefix?: string;
  /** Defaults to 'id' */
  hashKey?: string;
  readCapacityUnits?: ProvisionedThroughput["ReadCapacityUnits"];
  writeCapacityUnits?: ProvisionedThroughput["WriteCapacityUnits"];
  specialKeys?: DynamoDBStoreOptionsSpecialKey[];
  skipThrowMissingSpecialKeys?: boolean;
  /**
   * @deprecated
   * Upgrade to DynamoDB's TimeToLive configuration.
   */
  reapInterval?: number;
}

interface DynamoDBStoreOptionsSpecialKey {
  name: string; // The session key
  type: ScalarAttributeType | "B" | "N" | "S";
}

export type DynamoDBStore<
  Session extends Record<string, unknown> = Record<string, unknown>
> = Store & {
  readonly client: DynamoDBClient;
  new (options?: DynamoDBStoreOptions): DynamoDBStore<Session>;
  initialize(): Promise<void>;
  describeSessionsTable(): Promise<void>;
  createSessionsTable(): Promise<void>;
  get(
    id: string,
    callback: (err: CallbackError, session?: Session | null) => void
  ): void;
  getParsedSession(
    output: Pick<GetItemCommandOutput, "Item">
  ): Record<string, unknown>;
  set(id: string, callback: (err: CallbackError) => void): void;
  reap(callback?: (err: CallbackError) => void): void;
  destroy(id: string, callback?: (err: CallbackError) => void): void;
  getExpiresValue(): number;
  touch(
    id: string,
    callback?: (err: CallbackError, results: { expires: number }) => void
  ): void;
  clearInterval(): void;
};

type CallbackError = Error | undefined | null;
