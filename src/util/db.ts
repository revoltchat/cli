import { ulid } from "ulid";
import { MongoClient } from "mongodb";
import type { ClientboundNotification } from 'revolt.js/dist/websocket/notifications';

var client: MongoClient;

export async function connectDB() {
    if (client) return client;
    client = new MongoClient(process.env.MONGODB ?? `mongodb://localhost`);
    await client.connect();
    return client;
}

export async function publish(topic: string, data: ClientboundNotification) {
    await (await connectDB())
        .db('revolt')
        .collection('pubsub')
        .insertOne({
            _id: ulid() as any,
            topic: `"${topic}"`,
            source: `revolt-cli`,
            data: JSON.stringify(data)
        });
}

export async function publishAsUser(user_id: string, data: ClientboundNotification) {
    let memberships = (await (await connectDB())
        .db('revolt')
        .collection('server_members')
        .find({ "_id.user": user_id })
        .toArray())
        .map(x => x._id.server);
    
    await publish(user_id, data);
    for (let id of memberships) {
        await publish(id, data);
    }
}
