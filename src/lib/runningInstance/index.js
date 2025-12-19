import { ObjectId } from 'mongodb'
import { allAttributesByCaseModel } from '../attribute'
import {
  ARTIFACT_COLLECTION,
  ATTRIBUTE_COLLECTION,
  CASE_MODEL_COLLECTION,
  ITEM_COLLECTION,
  PRECONDITION_COLLECTION,
  RUNNING_INSTANCE_COLLECTION,
  TACTIC_COLLECTION,
  connectToDatabase,
} from '../db'

export async function getRunningInstanceById(id) {
  const client = await connectToDatabase()
  const db_instance = client.db()
  const collection = await db_instance.collection(RUNNING_INSTANCE_COLLECTION)
  const runningInstance = await collection.findOne({ _id: ObjectId(id) })
  // .aggregate([
  //   {
  //     $lookup: {
  //       from: CASE_MODEL_COLLECTION,
  //       localField: "idCaseModel",
  //       foreignField: "_id",
  //       as: "caseModel",
  //     },
  //   },
  //   {
  //     $unwind: "$caseModel",
  //   },
  //   {
  //     $project: {
  //       _id: 1,
  //       caseModel: {
  //         _id: 1,
  //         name: 1,
  //       },
  //       updatedAt: {
  //         $dateToString: {
  //           format: "%Y-%m-%d %H:%M:%S",
  //           date: "$updatedAt",
  //           timezone: "America/Sao_Paulo",
  //         },
  //       },
  //       status: 1,
  //       alias: 1,
  //     },
  //   }]);
  client.close()
  return runningInstance
}

export async function createRunningInstance(idCaseModel) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(RUNNING_INSTANCE_COLLECTION)

  // collection.insertOne returns the id of the object that was inserted
  const newRunningInstance = await collection.insertOne({
    idCaseModel: ObjectId(idCaseModel),
    values: {},
    status: 'CREATED',
    updatedAt: new Date(),
  })
  client.close()
  return newRunningInstance
}

export async function getForm(id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(RUNNING_INSTANCE_COLLECTION)
  const runningInstance = await collection.findOne({ _id: ObjectId(id) })

  const { values, idCaseModel, status, alias } = runningInstance

  // get itens of an case model
  const caseModelCollection = await db_instance.collection(CASE_MODEL_COLLECTION)
  const caseModel = await caseModelCollection.findOne({
    _id: ObjectId(idCaseModel),
  })

  const artifacts = await db_instance
    .collection(ARTIFACT_COLLECTION)
    .find({
      idCaseModel: ObjectId(idCaseModel),
    })
    .toArray()

  const items = await db_instance
    .collection(ITEM_COLLECTION)
    .find({
      idArtifact: { $in: artifacts.map((artifact) => artifact._id) },
    })
    .toArray()

  const attributes = await db_instance
    .collection(ATTRIBUTE_COLLECTION)
    .find({
      idItem: { $in: items.map((item) => item._id) },
    })
    .toArray()

  client.close()

  caseModel['artifacts'] = artifacts
    .map((artifact) => {
      artifact.items = items.filter((item) => {
        return item.idArtifact.toString() === artifact._id.toString()
      })
      artifact.items.forEach((item) => {
        item.attributes = attributes.filter((attribute) => {
          return attribute.idItem.toString() === item._id.toString()
        })
      })
      return artifact
    })
    .reduce(
      (acc, artifact) => {
        if (!acc[artifact.type]) {
          acc[artifact.type] = []
        }
        acc[artifact.type].push(artifact)
        return acc
      },
      {
        context: [],
        environment: [],
      }
    )

  const caseModelAttributes = await allAttributesByCaseModel(caseModel._id)

  return {
    caseModel: {
      ...caseModel,
      attributes: caseModelAttributes,
    },
    values,
    status,
    alias,
  }
}

export async function updateValues({ _id, ...values }) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(RUNNING_INSTANCE_COLLECTION)
  const runningInstance = await collection.updateOne(
    { _id: ObjectId(_id) },
    {
      $set: { ...values, updatedAt: new Date() },
    }
  )
  client.close()
  return runningInstance
}

export async function updateStatus({ _id, status }) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(RUNNING_INSTANCE_COLLECTION)
  const runningInstance = await collection.updateOne(
    { _id: ObjectId(_id) },
    {
      $set: { status, updatedAt: new Date() },
    }
  )
  client.close()
  return runningInstance
}

export async function getRunningInstances({
  skip = 0,
  limit = 10,
  alias,
  search,
  caseType,
  status,
  orderBy,
  orderDirection = 'asc',
}) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(RUNNING_INSTANCE_COLLECTION)

  const aggregate = [
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
    {
      $project: {
        _id: 1,
        caseModel: {
          _id: 1,
          name: 1,
        },
        updatedAt: 1,
        status: 1,
        alias: 1,
      },
    },
  ]

  if (caseType) {
    aggregate.unshift({
      $match: {
        idCaseModel: ObjectId(caseType),
      },
    })
  }

  if (alias) {
    aggregate.unshift({
      $match: {
        alias: {
          $regex: alias,
          $options: 'i',
        },
      },
    })
  }

  if (search) {
    aggregate.unshift({
      $search: {
        index: 'default',
        text: {
          query: search,
          path: ['caseModel.name', 'alias'],
        },
      },
    })
  }

  if (status) {
    aggregate.unshift({
      $match: {
        status: {
          $regex: status,
          $options: 'i',
        },
      },
    })
  }

  const runningInstances = await collection
    .aggregate([
      ...aggregate,
      {
        $sort: {
          updatedAt: -1,
        },
      },
    ])
    .sort({
      [orderBy || 'updatedAt']: orderDirection === 'asc' ? 1 : -1,
    })
    .skip(Number(skip))
    .limit(Number(limit))
    .toArray()
  client.close()
  return runningInstances
}

async function analyzeAttribute(attribute, value, db_instance) {
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
    '=': (a, b) => a == b,
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

  const collection = await db_instance.collection(PRECONDITION_COLLECTION)
  let preconditions = await collection
    .aggregate([
      {
        $match: {
          idAttribute: ObjectId(attribute._id),
          // idTactic is not null
          idTactic: { $ne: null },
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
    ])
    .map((precondition) => ({
      ...precondition,
      tactics: precondition.tactic,
      tactic: precondition?.tactic[0],
      value: Number(precondition.value),
    }))
    .toArray()

  preconditions = preconditions.filter((precondition) => {
    const { operator, value: preconditionValue } = precondition
    return mapperFn[operator](value, preconditionValue)
  })

  return {
    analysis: {
      result: analysis,
      value,
      normalRangeOfValues: { min, max },
    },
    tactics: preconditions
      .filter((p) => p.tactic)
      .reduce((acc, precondition) => {
        const {
          tactic: { name, description, _id },
        } = precondition
        acc.push({
          name,
          description,
          _id,
        })
        return acc
      }, []),
  }
}

export async function analyzeInstance(_id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(RUNNING_INSTANCE_COLLECTION)
  const runningInstance = await collection.findOne({ _id: ObjectId(_id) })

  // get values with number type
  const attributesIds = Object.entries(runningInstance.values)
    .filter(([key, value]) => typeof value === 'number')
    .map(([key, value]) => ObjectId(key))

  const attributes = await db_instance
    .collection(ATTRIBUTE_COLLECTION)
    .find({
      _id: { $in: attributesIds },
    })
    .map(async (attribute) => {
      return {
        ...attribute,
        value: runningInstance.values[attribute._id.toString()],
        ...(await analyzeAttribute(
          attribute,
          runningInstance.values[attribute._id.toString()],
          db_instance
        )),
      }
    })
    .toArray()

  client.close()
  return { analysis: attributes }
}
