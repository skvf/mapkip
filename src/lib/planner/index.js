import { ObjectId } from 'mongodb'

import { PLANNER_COLLECTION, connectToDatabase } from '../db'

export const PLANNER_STATUS = {
  NOT_STARTED: 'not_started',
  ON_QUEUE: 'on_queue',
  RUNNING: 'running',
  FINISHED: 'finished',
  ERROR: 'error',
}

/**
 * Creates a new planner document in the database.
 *
 * @param {Object} params - The parameters for creating a planner.
 * @param {string} params.idInstance - The ID of the instance.
 * @param {string} [params.id] - The optional ID of the planner.
 * @param {Object} params.content - The content of the planner.
 * @returns {Object} The newly created planner document.
 */
export async function createPlanner({ idInstance, id, content }) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  // create planner with content
  const collection = await db_instance.collection(PLANNER_COLLECTION)

  // collection.insertOne returns the id of the object that was inserted
  const newPlanner = await collection.insertOne({
    idInstance: ObjectId(idInstance),
    _id: id ? ObjectId(id) : ObjectId(),
    content,
    mdpText: '',
    status: PLANNER_STATUS.NOT_STARTED,
    queueAt: null,
    startUpAt: null,
    finishAt: null,
    updatedAt: Date.now(),
    createdAt: Date.now(),
  })

  client.close()
  return newPlanner
}

/**
 * Updates a planner document in the database.
 *
 * @param {Object} params - The parameters for updating a planner.
 * @param {string} params._id - The ID of the planner.
 * @param {Object} params.planner - The content to update in the planner.
 * @returns {Object} The updated planner document.
 */
export async function updatePlanner({ _id, ...planner }) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(PLANNER_COLLECTION)
  const updatedPlanner = await collection.updateOne(
    { _id: ObjectId(_id) },
    {
      $set: { ...planner, updatedAt: Date.now() },
    },
    {
      returnOriginal: false,
    }
  )
  client.close()
  return updatedPlanner
}

/**
 * Get a planner document from the database
 *
 * @param {ObjectId} id - The ID of the planner.
 * @returns {Object} The planner document.
 */
export async function getPlanner(id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(PLANNER_COLLECTION)
  const planner = await collection.findOne({ _id: ObjectId(id) })
  client.close()
  return planner
}

/**
 * Get a list of planners on queue ordered by queueAt date ascending.
 *
 * @returns {Array} The list of planners on queue ordered by queueAt date ascending.
 */
export async function queue() {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(PLANNER_COLLECTION)
  const planners = await collection
    .find({ status: PLANNER_STATUS.ON_QUEUE })
    .sort({ queueAt: 1 })
    // format date to ISO string
    .map((planner) => ({
      ...planner,
      queueAt: new Date(planner.queueAt).toISOString(),
      updatedAt: new Date(planner.updatedAt).toISOString(),
      createdAt: new Date(planner.createdAt).toISOString(),
    }))
    .toArray()
  client.close()
  return planners
}

/**
 * Get a list of planners from the database.
 *
 * @returns {Array} The list of planners.
 */
export async function allPlanners({ status, caseType, instanceId, skip, limit }) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(PLANNER_COLLECTION)

  let filterObject = {}

  if (status || caseType || instanceId) {
    if (instanceId) {
      filterObject.idInstance = instanceId
    }
  }

  const planners = await collection
    .find({
      idInstance: filterObject.idInstance ? ObjectId(filterObject.idInstance) : { $exists: true },
      status: status && status !== 'all' ? status : { $exists: true },
    })
    .sort({ createdAt: -1 })
    .map((planner) => ({
      ...planner,
      queueAt: new Date(planner.queueAt).toISOString(),
      createdAt: new Date(planner.createdAt).toISOString(),
    }))
    .skip(skip ? parseInt(skip) : 0)
    .limit(limit ? parseInt(limit) : 10)
    .toArray()
  client.close()
  return planners
}
