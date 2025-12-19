import { ITEM_COLLECTION, connectToDatabase } from '../db'
import { ObjectId } from 'mongodb'

export async function createItem(idArtifact) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(ITEM_COLLECTION)

  // collection.insertOne returns the id of the object that was inserted
  const newItem = await collection.insertOne({
    name: 'Item without a name',
    description: 'Longer description',
    idArtifact: ObjectId(idArtifact),
    updatedAt: Date.now(),
  })
  client.close()
  return newItem
}

export async function getItem(id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(ITEM_COLLECTION)
  const item = await collection.findOne({ _id: ObjectId(id) })
  client.close()
  return item
}

export async function allItems(idArtifact) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(ITEM_COLLECTION)
  const items = await collection.find({ idArtifact: ObjectId(idArtifact) }).toArray()
  client.close()
  return items
}

export async function editItem({ _id, ...item }) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(ITEM_COLLECTION)
  const updatedItem = await collection.updateOne(
    { _id: ObjectId(_id) },
    {
      $set: { ...item, updatedAt: Date.now() },
    }
  )
  client.close()
  return updatedItem
}

export async function deleteItem(_id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(ITEM_COLLECTION)
  const deletedItem = await collection.deleteOne({ _id: ObjectId(_id) })
  client.close()
  return deletedItem
}
