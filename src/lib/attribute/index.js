import { ObjectId } from 'mongodb'

import {
  ARTIFACT_COLLECTION,
  ATTRIBUTE_COLLECTION,
  ITEM_COLLECTION,
  connectToDatabase,
} from '../db'
import { getPreconditionsByAttributeId } from '../precondition'

export async function createAttribute(idItem) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(ATTRIBUTE_COLLECTION)

  const data = {
    name: 'Attribute without a name',
    code: 'CODE',
    type: 'string',
    unit: 'Unit of measures',
    rangeOfValues: [0, 0],
    normalRangeOfValues: [0, 0],
    idItem: ObjectId(idItem),
    updatedAt: Date.now(),
  }

  // collection.insertOne returns the id of the object that was inserted
  const newAttribute = await collection.insertOne(data)
  client.close()
  return { ...newAttribute, ...data }
}

export async function getAttribute(id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(ATTRIBUTE_COLLECTION)
  const attribute = await collection.findOne({ _id: ObjectId(id) })
  client.close()
  return attribute
}

export async function allAttributes(idItem) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(ATTRIBUTE_COLLECTION)
  const attributes = await collection
    .find({ idItem: ObjectId(idItem) })
    .map((attribute) => ({ ...attribute, __type__: 'attribute' }))
    .toArray()
  client.close()
  return attributes
}

/**
 * Returns all attributes of a case modeler
 * @param {String} idCaseModel
 * @returns
 */
export async function allAttributesByCaseModel(idCaseModel) {
  let client
  try {
    client = await connectToDatabase()
    const db_instance = client.db()

    // obtain artifacts from case modeler
    const artifactCollection = await db_instance.collection(ARTIFACT_COLLECTION)
    const artifacts = await artifactCollection
      .find({ idCaseModel: ObjectId(idCaseModel) })
      .toArray()

    // obtain items from artifacts
    const itemCollection = await db_instance.collection(ITEM_COLLECTION)
    const items = await itemCollection
      .find({ idArtifact: { $in: artifacts.map((a) => a._id) } })
      .toArray()

    // obtain attributes from items sorted by name
    const attributeCollection = await db_instance.collection(ATTRIBUTE_COLLECTION)
    let attributes = await attributeCollection
      .find({ idItem: { $in: items.map((i) => i._id) } })
      .map((attribute) => ({ ...attribute, __type__: 'Attribute' }))
      .toArray()

    // remove attributes with type equal 'string' or 'datetime'
    attributes = attributes.filter((a) => a.type !== 'string' && a.type !== 'datetime')

    // sort attributes by name
    attributes.sort((a, b) => a.name.localeCompare(b.name))

    return attributes
  } catch (error) {
    console.error(error)
    throw error
  } finally {
    client.close()
  }
}

export async function editAttribute({ _id, ...attribute }) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(ATTRIBUTE_COLLECTION)
  const updatedAttribute = await collection.findOneAndUpdate(
    { _id: ObjectId(_id) },
    {
      $set: {
        ...attribute,
        idItem: ObjectId(attribute.idItem),
        updatedAt: Date.now(),
      },
    },
    {
      returnDocument: 'after',
    }
  )
  client.close()
  return updatedAttribute
}

export async function deleteAttribute(_id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(ATTRIBUTE_COLLECTION)
  const deletedAttribute = await collection.deleteOne({ _id: ObjectId(_id) })
  client.close()
  return deletedAttribute
}

export async function analyzeAttribute({ idAttribute, value }) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(ATTRIBUTE_COLLECTION)
  const attribute = await collection.findOne({ _id: ObjectId(idAttribute) })

  // check value is in range of values
  const { normalRangeOfValues } = attribute
  const [min, max] = normalRangeOfValues
  const isInRange = value >= min && value <= max

  // check preconditions
  const analysis = isInRange ? 'normal' : 'abnormal'

  if (isInRange) {
    return {
      analysis: {
        result: analysis,
        value,
        normalRangeOfValues: { min, max },
      },
      tactics: [],
    }
  }

  const mapperFn = {
    '>': (a, b) => a > b,
    '<': (a, b) => a < b,
    '>=': (a, b) => a >= b,
    '<=': (a, b) => a <= b,
    '==': (a, b) => a == b,
    '!=': (a, b) => a != b,
  }

  const mapperAnalysis = {
    '>': 'higher',
    '<': 'lower',
    '>=': 'higher',
    '<=': 'lower',
    '==': 'equal',
    '!=': 'different',
  }

  const preconditions = await getPreconditionsByAttributeId(idAttribute)
  const preconditionsWithValues = preconditions
    .map((p) => {
      const { operator, value: valuePrecondition } = p
      const result = mapperFn[operator](value, valuePrecondition)
      const analysisString = mapperAnalysis[operator]
      return { ...p, result, analysisString }
    })
    .filter((p) => p.result)
    .map((p) => ({
      result: p.result,
      analysisString: p.analysisString,
      tactic: p.tactic,
    }))

  client.close()
  return {
    analysis: {
      result: analysis,
      value,
      normalRangeOfValues: {
        min,
        max,
      },
    },
    tactics: preconditionsWithValues,
  }
}

export async function setCriticals(criticals) {
  // criticals = {[idAttribute]: true|false ...}

  // group attributes ids critical or not critical
  const attributes = Object.entries(criticals).reduce(
    (acc, [id, isCritical]) => {
      if (isCritical) {
        acc.criticals.push(id)
      } else {
        acc.notCriticals.push(id)
      }
      return acc
    },
    { criticals: [], notCriticals: [] }
  )

  // update attributes

  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(ATTRIBUTE_COLLECTION)
  await collection.updateMany(
    { _id: { $in: attributes.criticals.map((id) => ObjectId(id)) } },
    { $set: { isStatusCritical: true } }
  )
  await collection.updateMany(
    { _id: { $in: attributes.notCriticals.map((id) => ObjectId(id)) } },
    { $set: { isStatusCritical: false } }
  )

  client.close()

  return attributes
}
