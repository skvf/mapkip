import { ObjectId } from 'mongodb'

import {
  PRECONDITION_COLLECTION,
  STEP_COLLECTION,
  TACTIC_COLLECTION,
  TASK_COLLECTION,
  connectToDatabase,
} from '../db'

export async function createPrecondition({
  idTactic,
  idStep,
  idAttribute,
  idMetric,
  idEvent,
  operator,
  value,
}) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(PRECONDITION_COLLECTION)
  const newPrecondition = await collection.insertOne({
    idTactic: idTactic ? ObjectId(idTactic) : null,
    idStep: idStep ? ObjectId(idStep) : null,
    idMetric: idMetric ? ObjectId(idMetric) : null,
    idEvent: idEvent ? ObjectId(idEvent) : null,
    idAttribute: ObjectId(idAttribute),
    operator: operator,
    value: value,
    updatedAt: Date.now(),
  })
  client.close()
  return newPrecondition
}

export async function getPrecondition(id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(PRECONDITION_COLLECTION)
  const Precondition = await collection.findOne({ _id: ObjectId(id) })
  client.close()
  return Precondition
}

export async function getPreconditionsByTacticOrStepId({ idTactic, idStep, idEvent }) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  // get Preconditions from tactic with attribute object
  const collection = await db_instance.collection(PRECONDITION_COLLECTION)
  const Preconditions = await collection
    .aggregate([
      {
        $match: {
          idTactic: idTactic ? ObjectId(idTactic) : null,
          idStep: idStep ? ObjectId(idStep) : null,
          idEvent: idEvent ? ObjectId(idEvent) : null,
        },
      },
      {
        $lookup: {
          from: 'attributes',
          localField: 'idAttribute',
          foreignField: '_id',
          as: 'attribute',
        },
      },
      {
        $unwind: {
          path: '$attribute',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'metrics',
          localField: 'idMetric',
          foreignField: '_id',
          as: 'metric',
        },
      },
      {
        $unwind: {
          path: '$metric',
          preserveNullAndEmptyArrays: true,
        },
      },
    ])
    .toArray()
  client.close()
  return Preconditions
}

export async function getPreconditionsByAttributeId(idAttribute) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(PRECONDITION_COLLECTION)
  const preconditions = await collection
    .aggregate([
      {
        $match: {
          idAttribute: ObjectId(idAttribute),
        },
      },
      {
        $lookup: {
          from: TACTIC_COLLECTION,
          localField: 'idTactic',
          foreignField: '_id',
          as: 'tactic',
        },
      },
      {
        $lookup: {
          from: STEP_COLLECTION,
          localField: 'idStep',
          foreignField: '_id',
          as: 'step',
        },
      },
      {
        $lookup: {
          from: TASK_COLLECTION,
          localField: 'idTactic',
          foreignField: 'idTactic',
          as: 'task',
        },
      },
    ])
    .toArray()
  client.close()
  return preconditions.map((precondition) => ({
    ...precondition,
    tactic: precondition.tactic[0],
    step: precondition.step[0],
    value: Number(precondition.value),
  }))
}

export async function editPrecondition({ _id, ...Precondition }) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(PRECONDITION_COLLECTION)
  const updatedPrecondition = await collection.updateOne(
    { _id: ObjectId(_id) },
    { $set: Precondition }
  )
  client.close()
  return updatedPrecondition
}

export async function deletePrecondition(_id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(PRECONDITION_COLLECTION)
  const deletedPrecondition = await collection.deleteOne({
    _id: ObjectId(_id),
  })
  client.close()
  return deletedPrecondition
}
