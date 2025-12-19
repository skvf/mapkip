import { PERMISSION_COLLECTION, connectToDatabase } from '../db'
import { ObjectId } from 'mongodb'

export async function createPermission(idRole, permission) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(PERMISSION_COLLECTION)

  // collection.insertOne returns the id of the object that was inserted
  const newPermission = await collection.insertOne({
    name: permission,
    idRole: ObjectId(idRole),
    updatedAt: Date.now(),
  })
  client.close()
  return newPermission
}

export async function getPermission(id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(PERMISSION_COLLECTION)
  const permission = await collection.findOne({ _id: ObjectId(id) })
  client.close()
  return permission
}

export async function allPermissions(idRole) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(PERMISSION_COLLECTION)
  const permissions = await collection.find({ idRole: ObjectId(idRole) }).toArray()
  client.close()
  return permissions
}

export async function editPermission({ _id, ...permission }) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(PERMISSION_COLLECTION)
  const updatedPermission = await collection.updateOne(
    { _id: ObjectId(_id) },
    {
      $set: { ...permission, updatedAt: Date.now() },
    }
  )
  client.close()
  return updatedPermission
}

export async function deletePermission(_id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(PERMISSION_COLLECTION)
  const deletedPermission = await collection.deleteOne({ _id: ObjectId(_id) })
  client.close()
  return deletedPermission
}
