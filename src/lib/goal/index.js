import { ObjectId } from 'mongodb'

import { ATTRIBUTE_COLLECTION, GOAL_COLLECTION, METRIC_COLLECTION, connectToDatabase } from '../db'

export async function createGoal({ idTactic, idAttribute, idMetric, operator, value }) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(GOAL_COLLECTION)
  const newGoal = await collection.insertOne({
    idTactic: ObjectId(idTactic),
    idAttribute: idAttribute ? ObjectId(idAttribute) : null,
    idMetric: idMetric ? ObjectId(idMetric) : null,
    operator: operator,
    value: value,
    updatedAt: Date.now(),
  })
  client.close()
  return newGoal
}

export async function getGoal(id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(GOAL_COLLECTION)
  const goal = await collection.findOne({ _id: ObjectId(id) })
  client.close()
  return goal
}

export async function getGoals(idTactic) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  // get goals from tactic with attribute object
  const collection = await db_instance.collection(GOAL_COLLECTION)
  const goals = await collection
    .aggregate([
      {
        $match: { idTactic: ObjectId(idTactic) },
      },
      {
        $lookup: {
          from: ATTRIBUTE_COLLECTION,
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
          from: METRIC_COLLECTION,
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
  return goals
}

export async function editGoal({ _id, ...goal }) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(GOAL_COLLECTION)
  const updatedGoal = await collection.updateOne({ _id: ObjectId(_id) }, { $set: goal })
  client.close()
  return updatedGoal
}

export async function deleteGoal(_id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(GOAL_COLLECTION)
  const deletedGoal = await collection.deleteOne({ _id: ObjectId(_id) })
  client.close()
  return deletedGoal
}
