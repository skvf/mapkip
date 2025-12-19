import { ObjectId } from 'mongodb'

import { CASE_MODEL_COLLECTION, RUNNING_INSTANCE_COLLECTION, connectToDatabase } from '../db'

export async function createCaseModel() {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(CASE_MODEL_COLLECTION)

  // collection.insertOne returns the id of the object that was inserted
  const newCaseModel = await collection.insertOne({
    name: 'Case model without title',
    description: 'Longer description',
    updatedAt: Date.now(),
  })
  client.close()
  return newCaseModel
}

export async function getCaseModel(id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(CASE_MODEL_COLLECTION)
  const caseModel = await collection.findOne({ _id: ObjectId(id) })
  client.close()
  return caseModel
}

export async function allCaseModel() {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(CASE_MODEL_COLLECTION)
  const caseModel = await collection
    .find({})
    // order by name ascending
    .sort({ name: 1 })
    .toArray()
  client.close()
  return caseModel
}

export async function editCaseModel({ _id, ...caseModel }) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(CASE_MODEL_COLLECTION)
  const updatedCaseModel = await collection.updateOne(
    { _id: ObjectId(_id) },
    {
      $set: { ...caseModel, updatedAt: Date.now() },
    }
  )
  client.close()
  return updatedCaseModel
}

export async function deleteCaseModel(_id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(CASE_MODEL_COLLECTION)
  const deletedCaseModel = await collection.deleteOne({ _id: ObjectId(_id) })
  client.close()
  return deletedCaseModel
}

export async function getRunningInstances() {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(RUNNING_INSTANCE_COLLECTION)

  // GET running instances grouped by case model
  const runningInstances = await collection
    .aggregate([
      {
        $lookup: {
          from: CASE_MODEL_COLLECTION,
          localField: 'idCaseModel',
          foreignField: '_id',
          as: 'caseModel',
        },
      },
      {
        $group: {
          _id: '$idCaseModel',
          count: { $sum: 1 },
          caseModel: { $first: '$caseModel' },
        },
      },
      {
        $unwind: '$caseModel',
      },
      {
        $project: {
          _id: 0,
          idCaseModel: '$_id',
          count: 1,
          caseModel: 1,
        },
      },
    ])
    .toArray()

  client.close()
  return runningInstances
}
