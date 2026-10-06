import { MongoClient } from "mongodb"

// En Vercel las funciones se reciclan, así que guardamos el cliente en
// globalThis para reutilizar la conexión y no abrir una nueva en cada visita.
const globalForMongo = globalThis;

export const getDb = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Falta la variable de entorno MONGODB_URI");
  }

  let client = globalForMongo.__mongoClient;

  if (!client) {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    await client.connect();
    globalForMongo.__mongoClient = client;
    console.log("✅ Conectado a MongoDB Atlas");
  }

  return client.db(process.env.MONGODB_DB || "portafolio");
};

export const visitasCollection = async () => {
  const db = await getDb();
  return db.collection("visitas");
};