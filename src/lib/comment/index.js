import { ObjectId } from 'mongodb'

import { COMMENT_COLLECTION, connectToDatabase } from '../db'

export async function createComment({ idPlanner, text }) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(COMMENT_COLLECTION)
  const now = new Date()
  const data = {
    idPlanner: ObjectId(idPlanner),
    text: text,
    createdAt: now,
  }
  const newComment = await collection.insertOne(data)
  client.close()
  return { ...newComment, ...data, createdAt: now.toISOString().slice(0, 19).replace('T', ' ') }
}

export async function allComments(idPlanner) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(COMMENT_COLLECTION)

  const comments = await collection
    .aggregate([
      { $match: { idPlanner: ObjectId(idPlanner) } },
      {
        $project: {
          _id: 1,
          idPlanner: 1,
          text: 1,
          createdAt: {
            $dateToString: {
              format: '%Y-%m-%d %H:%M:%S',
              date: { $toDate: '$createdAt' },
              timezone: 'America/Sao_Paulo',
            },
          },
        },
      },
    ])
    .toArray()

  client.close()
  return comments
}
