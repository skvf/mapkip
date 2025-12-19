import { ObjectId } from 'mongodb'

import { ARTIFACT_COLLECTION, CASE_MODEL_COLLECTION, connectToDatabase } from '../db'

export async function createArtifact(idCaseModel) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(ARTIFACT_COLLECTION)

  // collection.insertOne returns the id of the object that was inserted
  const newArtifact = await collection.insertOne({
    name: 'Artifact without a name',
    description: 'Longer description',
    type: 'context',
    idCaseModel: ObjectId(idCaseModel),
    updatedAt: Date.now(),
  })
  client.close()
  return newArtifact
}

export async function getArtifact(id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(ARTIFACT_COLLECTION)

  // find artifact by id with case model object
  const artifact = await collection
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
  return artifact[0]
}

export async function allContextArtifacts(idCaseModel) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(ARTIFACT_COLLECTION)
  const artifact = await collection
    .find({ idCaseModel: ObjectId(idCaseModel), type: 'context' })
    .toArray()
  client.close()
  return artifact
}

export async function allEnvironmentArtifacts(idCaseModel) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(ARTIFACT_COLLECTION)
  const artifact = await collection
    .find({ idCaseModel: ObjectId(idCaseModel), type: 'environment' })
    .toArray()
  client.close()
  return artifact
}

export async function editArtifact({ _id, ...artifact }) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(ARTIFACT_COLLECTION)
  const updatedCaseModel = await collection.updateOne(
    { _id: ObjectId(_id) },
    {
      $set: { ...artifact, updatedAt: Date.now() },
    }
  )
  client.close()
  return updatedCaseModel
}

export async function deleteArtifact(_id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(ARTIFACT_COLLECTION)
  const deletedArtifact = await collection.deleteOne({ _id: ObjectId(_id) })
  client.close()
  return deletedArtifact
}
