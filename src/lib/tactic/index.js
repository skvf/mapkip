import { ObjectId } from 'mongodb'

import { CASE_MODEL_COLLECTION, TACTIC_COLLECTION, connectToDatabase } from '../db'

export async function createTactic(idCaseModel) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(TACTIC_COLLECTION)
  const newTactic = await collection.insertOne({
    idCaseModel: ObjectId(idCaseModel),
    name: 'Tactic Name',
    description: 'Tactic description',
    updatedAt: Date.now(),
  })
  client.close()
  return newTactic
}

export async function getTactic(id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(TACTIC_COLLECTION)
  const tactic = await collection
    .aggregate([
      {
        $match: { _id: ObjectId(id) },
      },
      {
        $lookup: {
          from: CASE_MODEL_COLLECTION,
          localField: 'idCaseModel',
          foreignField: '_id',
          as: 'caseModel',
        },
      },
      {
        $unwind: '$caseModel',
      },
    ])
    .toArray()
  client.close()
  return tactic[0]
}

export async function allTactics(idCaseModel) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(TACTIC_COLLECTION)
  const tactic = await collection.find({ idCaseModel: ObjectId(idCaseModel) }).toArray()
  client.close()
  return tactic
}

export async function editTactic({ _id, ...tactic }) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(TACTIC_COLLECTION)
  const updatedTactic = await collection.updateOne(
    { _id: ObjectId(_id) },
    {
      $set: { ...tactic, updatedAt: Date.now() },
    }
  )
  client.close()
  return updatedTactic
}

export async function deleteTactic(_id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(TACTIC_COLLECTION)
  const deletedTactic = await collection.deleteOne({ _id: ObjectId(_id) })
  client.close()
  return deletedTactic
}
