import { ObjectId } from 'mongodb'

import { POSTCONDITION_COLLECTION, connectToDatabase } from '../db'

export async function createPostCondition(payload) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(POSTCONDITION_COLLECTION)
  const result = await collection.insertOne({
    idStep: ObjectId(payload.idStep),
    idAttribute: ObjectId(payload.idAttribute),
    idEvent: ObjectId(payload.idEvent),
    effect: payload.effect,
    probability: payload.probability,
    update: payload.update,
    updatedAt: Date.now(),
  })
  client.close()
  return result
}

export async function getPostcondition(id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(POSTCONDITION_COLLECTION)
  const Postcondition = await collection.findOne({ _id: ObjectId(id) })
  client.close()
  return Postcondition
}

export async function getPostconditionsByStepId(idStep) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(POSTCONDITION_COLLECTION)
  const postconditions = await collection.find({ idStep: ObjectId(idStep) }).toArray()
  client.close()
  return postconditions
}

export async function getPostconditionsByEventId(idEvent) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(POSTCONDITION_COLLECTION)
  const postconditions = await collection.find({ idEvent: ObjectId(idEvent) }).toArray()
  client.close()
  return postconditions
}

export async function updatePostcondition({ _id, ...payload }) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(POSTCONDITION_COLLECTION)
  const result = await collection.updateOne(
    { _id: ObjectId(_id) },
    {
      $set: {
        effect: payload.effect,
        probability: payload.probability,
        updates: payload.updates.map((update) => ({
          ...update,
          idAttribute: ObjectId(update.idAttribute),
        })),
        updatedAt: Date.now(),
      },
    }
  )
  client.close()
  return result
}

export async function deletePostcondition(id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(POSTCONDITION_COLLECTION)
  const result = await collection.deleteOne({ _id: ObjectId(id) })
  client.close()
  return result
}
