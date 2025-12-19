import { CAPABILITY_COLLECTION, connectToDatabase } from '../db'
import { ObjectId } from 'mongodb'

export async function createCapability(idRole, capability) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(CAPABILITY_COLLECTION)

  // collection.insertOne returns the id of the object that was inserted
  const newCapability = await collection.insertOne({
    name: capability,
    idRole: ObjectId(idRole),
    updatedAt: Date.now(),
  })
  client.close()
  return newCapability
}

export async function getCapability(id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(CAPABILITY_COLLECTION)
  const capability = await collection.findOne({ _id: ObjectId(id) })
  client.close()
  return capability
}

export async function allCapabilities(idRole) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(CAPABILITY_COLLECTION)
  const capabilities = await collection.find({ idRole: ObjectId(idRole) }).toArray()
  client.close()
  return capabilities
}

export async function editCapability({ _id, ...capability }) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(CAPABILITY_COLLECTION)
  const updatedCapability = await collection.updateOne(
    { _id: ObjectId(_id) },
    {
      $set: { ...capability, updatedAt: Date.now() },
    }
  )
  client.close()
  return updatedCapability
}

export async function deleteCapability(_id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(CAPABILITY_COLLECTION)
  const deletedCapability = await collection.deleteOne({ _id: ObjectId(_id) })
  client.close()
  return deletedCapability
}
