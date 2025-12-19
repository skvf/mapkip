import { ObjectId } from 'mongodb'

import { CASE_MODEL_COLLECTION, TACTIC_COLLECTION, TASK_COLLECTION, connectToDatabase } from '../db'

export async function createTask(idTactic) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(TASK_COLLECTION)
  const newTask = await collection.insertOne({
    name: 'Task Name',
    description: 'Task description',
    idTactic: ObjectId(idTactic),
    updatedAt: Date.now(),
  })
  client.close()
  return newTask
}

export async function getTask(id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(TASK_COLLECTION)
  // find the task with the id and get the tactic by idTactic using the $lookup
  const task = await collection
    .aggregate([
      {
        $match: { _id: ObjectId(id) },
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
          path: '$caseModel',
          preserveNullAndEmptyArrays: true,
        },
      },
    ])
    .next()

  client.close()
  return task
}

export async function allTasks(idTactic) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(TASK_COLLECTION)
  const task = await collection.find({ idTactic: ObjectId(idTactic) }).toArray()
  client.close()
  return task
}

export async function editTask({ _id, ...task }) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(TASK_COLLECTION)
  const updatedtask = await collection.updateOne(
    { _id: ObjectId(_id) },
    {
      $set: { ...task, updatedAt: Date.now() },
    }
  )
  client.close()
  return updatedtask
}

export async function deleteTask(_id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(TASK_COLLECTION)
  const deletedTask = await collection.deleteOne({ _id: ObjectId(_id) })
  client.close()
  return deletedTask
}
