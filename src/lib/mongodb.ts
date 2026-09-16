import { Db, MongoClient } from "mongodb";

const databaseName = process.env.MONGODB_DB ?? "lern_with_akshay";

declare global { var mongoClientPromise: Promise<MongoClient> | undefined; }

function getClientPromise() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured. Add it to .env.local.");
  const promise = global.mongoClientPromise ?? new MongoClient(process.env.MONGODB_URI).connect();
  if (process.env.NODE_ENV !== "production") global.mongoClientPromise = promise;
  return promise;
}

export async function db(): Promise<Db> { return (await getClientPromise()).db(databaseName); }
export { getClientPromise as clientPromise };
