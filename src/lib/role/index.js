import { ROLE_COLLECTION, connectToDatabase, CASE_MODEL_COLLECTION } from '../db'
import { ObjectId } from 'mongodb'

export async function createRole(idCaseModel) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(ROLE_COLLECTION)

  // collection.insertOne returns the id of the object that was inserted
  const newRole = await collection.insertOne({
    name: 'Role without a name',
    description: 'Longer description',
    idCaseModel: ObjectId(idCaseModel),
    updatedAt: Date.now(),
  })
  client.close()
  return newRole
}

export async function getRole(id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(ROLE_COLLECTION)
  const role = await collection
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
  return role[0]
}

export async function allRoles(idCaseModel) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(ROLE_COLLECTION)
  const roles = await collection.find({ idCaseModel: ObjectId(idCaseModel) }).toArray()
  client.close()
  return roles
}

export async function editRole({ _id, ...role }) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(ROLE_COLLECTION)
  const updatedRole = await collection.updateOne(
    { _id: ObjectId(_id) },
    {
      $set: { ...role, updatedAt: Date.now() },
    }
  )
  client.close()
  return updatedRole
}

export async function deleteRole(_id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(ROLE_COLLECTION)
  const deletedRole = await collection.deleteOne({ _id: ObjectId(_id) })
  client.close()
  return deletedRole
}
