import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";

const [name, email, password] = process.argv.slice(2);
if (!process.env.MONGODB_URI || !name || !email || !password) {
  console.error("Usage: MONGODB_URI=... npx tsx scripts/create-admin.ts \"Admin name\" admin@example.com strong-password"); process.exit(1);
}
const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const users = client.db(process.env.MONGODB_DB ?? "lern_with_akshay").collection("users");
await users.updateOne({ email: email.toLowerCase() }, { $set: { name, email: email.toLowerCase(), role: "admin", passwordHash: await bcrypt.hash(password, 12), active: true, createdAt: new Date() } }, { upsert: true });
await client.close(); console.log("Admin account created.");
