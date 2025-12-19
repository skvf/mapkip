import { ObjectId } from 'mongodb'

import {
  CASE_MODEL_COLLECTION,
  EVENT_COLLECTION,
  POSTCONDITION_COLLECTION,
  PRECONDITION_COLLECTION,
  connectToDatabase,
} from '../db'

/**
 * Create a blank event
 */
export async function createEvent(idCaseModel) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(EVENT_COLLECTION)

  const data = {
    description: 'Event without a description',
    updatedAt: Date.now(),
    idCaseModel: ObjectId(idCaseModel),
  }

  // collection.insertOne returns the id of the object that was inserted
  const newEvent = await collection.insertOne({
    ...data,
  })
  client.close()
  return { ...newEvent, ...data }
}

/**
 * Returns a event by id
 * @param {string} _id - The event id
 * @returns event
 * @returns null if the event does not exist
 */
export async function getEvent(_id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(EVENT_COLLECTION)
  const event = await collection
    .aggregate([
      {
        $match: { _id: ObjectId(_id) },
      },
      {
        // count preconditions
        $lookup: {
          from: PRECONDITION_COLLECTION,
          localField: '_id',
          foreignField: 'idEvent',
          as: 'preconditions',
        },
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
        $unwind: {
          path: '$caseModel',
          preserveNullAndEmptyArrays: true,
        },
      },
    ])
    .next()
  client.close()
  return event
}

/**
 * Update a event
 * @param {object} data - The data to update
 * @param {string} data._id - The event id
 * @param {string} data.description - The event description
 * @returns event
 */
export async function editEvent({ _id, ...event }) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(EVENT_COLLECTION)
  const editedEvent = await collection.findOneAndUpdate(
    { _id: ObjectId(_id) },
    { $set: { ...event, updatedAt: Date.now() } },
    { returnDocument: 'after' }
  )
  client.close()
  return editedEvent
}

/**
 * Delete a event
 * @param {string} _id - The event id
 * @returns event
 */
export async function deleteEvent(_id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(EVENT_COLLECTION)
  const deletedEvent = await collection.deleteOne({ _id: ObjectId(_id) })
  client.close()
  return deletedEvent
}

export async function allEvents(idCaseModel) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(EVENT_COLLECTION)
  const events = await collection
    .aggregate([
      {
        $match: { idCaseModel: new ObjectId(idCaseModel) },
      },
      {
        $lookup: {
          from: PRECONDITION_COLLECTION,
          localField: '_id',
          foreignField: 'idEvent',
          as: 'preconditions',
        },
      },
      {
        $lookup: {
          from: POSTCONDITION_COLLECTION,
          localField: '_id',
          foreignField: 'idEvent',
          as: 'effects',
        },
      },
    ])
    .toArray()

  client.close()
  return events
}
