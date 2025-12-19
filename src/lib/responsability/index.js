import { RESPONSABILITY_COLLECTION, connectToDatabase } from '../db'
import { ObjectId } from 'mongodb'

export async function createResponsability(idRole, responsability) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(RESPONSABILITY_COLLECTION)

  // collection.insertOne returns the id of the object that was inserted
  const newReponsability = await collection.insertOne({
    name: responsability,
    idRole: ObjectId(idRole),
    updatedAt: Date.now(),
  })
  client.close()
  return newReponsability
}

export async function getReponsability(id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(RESPONSABILITY_COLLECTION)
  const reponsability = await collection.findOne({ _id: ObjectId(id) })
  client.close()
  return reponsability
}

export async function allReponsabilities(idRole) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(RESPONSABILITY_COLLECTION)
  const reponsabilities = await collection.find({ idRole: ObjectId(idRole) }).toArray()
  client.close()
  return reponsabilities
}

export async function editReponsability({ _id, ...reponsability }) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(RESPONSABILITY_COLLECTION)
  const updatedReponsability = await collection.updateOne(
    { _id: ObjectId(_id) },
    {
      $set: { ...reponsability, updatedAt: Date.now() },
    }
  )
  client.close()
  return updatedReponsability
}

export async function deleteReponsability(_id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(RESPONSABILITY_COLLECTION)
  const deletedReponsability = await collection.deleteOne({
    _id: ObjectId(_id),
  })
  client.close()
  return deletedReponsability
}
