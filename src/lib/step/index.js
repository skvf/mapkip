import { ObjectId } from 'mongodb'

import {
  CASE_MODEL_COLLECTION,
  PRECONDITION_COLLECTION,
  ROLE_COLLECTION,
  STEP_COLLECTION,
  TACTIC_COLLECTION,
  TASK_COLLECTION,
  connectToDatabase,
} from '../db'

/**
 * Create a blank step
 */
export async function createStep({ idTactic, idTask }) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(STEP_COLLECTION)

  const data = {
    description: 'Step without a description',
    idTactic: idTactic ? ObjectId(idTactic) : null,
    idTask: idTask ? ObjectId(idTask) : null,
    idRole: null,
    cost: 0,
    updatedAt: Date.now(),
  }

  // collection.insertOne returns the id of the object that was inserted
  const newStep = await collection.insertOne({
    ...data,
  })
  client.close()
  return { ...newStep, ...data }
}

/**
 * Returns a step by id
 * @param {string} _id - The step id
 * @returns step
 * @returns null if the step does not exist
 */
export async function getStep(_id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(STEP_COLLECTION)
  const step = await collection
    .aggregate([
      {
        $match: { _id: ObjectId(_id) },
      },
      {
        $lookup: {
          from: ROLE_COLLECTION,
          localField: 'idRole',
          foreignField: '_id',
          as: 'assignedRole',
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
          from: TASK_COLLECTION,
          localField: 'idTask',
          foreignField: '_id',
          as: 'task',
        },
      },
      {
        // count preconditions
        $lookup: {
          from: PRECONDITION_COLLECTION,
          localField: '_id',
          foreignField: 'idStep',
          as: 'preconditions',
        },
      },
      {
        $lookup: {
          from: CASE_MODEL_COLLECTION,
          localField: 'tactic.idCaseModel',
          foreignField: '_id',
          as: 'caseModel',
        },
      },
      {
        $unwind: {
          path: '$tactic',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$assignedRole',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$task',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$caseModel',
          preserveNullAndEmptyArrays: true,
        },
      },
    ])
    .next()
  client.close()
  return step
}

/**
 * Returns all steps of a tactic
 * @param {string} idTactic - The tactic id
 * @returns steps
 * @returns null if the tactic does not exist
 * @returns empty array if the tactic does not have steps
 */
export async function allSteps(idTactic) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(STEP_COLLECTION)
  const steps = await collection.find({ idTactic: ObjectId(idTactic) }).toArray()
  client.close()
  return steps
}

export async function allStepsFromTask(idTask) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(STEP_COLLECTION)
  const steps = await collection.find({ idTask: ObjectId(idTask) }).toArray()
  client.close()
  return steps
}

/**
 * Update a step
 * @param {object} data - The data to update
 * @param {string} data._id - The step id
 * @param {string} data.description - The step description
 * @param {string} data.idRole - The step role id
 * @param {number} data.cost - The step cost
 * @returns step
 */
export async function editStep({ _id, ...step }) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(STEP_COLLECTION)
  const editedStep = await collection.findOneAndUpdate(
    { _id: ObjectId(_id) },
    { $set: { ...step, updatedAt: Date.now() } },
    { returnDocument: 'after' }
  )
  client.close()
  return editedStep
}

/**
 * Delete a step
 * @param {string} _id - The step id
 * @returns step
 */
export async function deleteStep(_id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(STEP_COLLECTION)
  const deletedStep = await collection.deleteOne({ _id: ObjectId(_id) })
  client.close()
  return deletedStep
}
