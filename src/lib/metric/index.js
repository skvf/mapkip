import { ObjectId } from 'mongodb'

import { METRIC_COLLECTION, TACTIC_COLLECTION, connectToDatabase } from '../db'

/**
 * Create a blank metric based on a tactic
 *
 * @param {String} idTactic tactic id
 * @returns new metric
 */
export async function createMetric(idTactic) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(METRIC_COLLECTION)

  // collection.insertOne returns the id of the object that was inserted
  const newMetric = await collection.insertOne({
    name: 'Metric without a name',
    code: 'CODE',
    type: 'string',
    unit: 'Unit of measures',
    rangeOfValues: [0, 0],
    normalRangeOfValues: [0, 0],
    idTactic: ObjectId(idTactic),
    updatedAt: Date.now(),
  })
  client.close()
  return newMetric
}

/**
 * Returns a metric by id
 *
 * @param {String} _id metric id
 * @returns metric
 */
export async function getMetric(_id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(METRIC_COLLECTION)
  const metric = await collection.findOne({ _id: ObjectId(_id) })
  client.close()
  return metric
}

/**
 * Returns all metrics of a tactic
 *
 * @param {String} idTactic tactic id
 * @returns metrics
 */
export async function allMetrics(idTactic, params) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  // merge params with default values
  const defaultParams = {
    limit: 100,
    offset: 0,
    sort: 'name',
    order: 'asc',
    search: '',
    filter: {
      type: 'all',
    },
  }
  params = { ...defaultParams, ...params }

  const collection = await db_instance.collection(METRIC_COLLECTION)
  const findQuery = {
    idTactic: ObjectId(idTactic),
    name: { $regex: params.search, $options: 'i' },
  }

  if (params.filter.type !== 'all') {
    findQuery.type = params.filter.type
  }

  const metrics = await collection
    .find(findQuery)
    .sort({ [params.sort]: params.order === 'asc' ? 1 : -1 })
    .skip(params.offset)
    .limit(params.limit)
    // adicionar campo chamado '__type__' com valor 'Metric'
    .map((metric) => ({ ...metric, __type__: 'Metric' }))
    .toArray()
  client.close()
  return metrics
}

/**
 * Edit a metric
 * @param {Object} metric metric to be edited
 * @returns edited metric
 */
export async function editMetric({ _id, ...metric }) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(METRIC_COLLECTION)
  const editedMetric = await collection.findOneAndUpdate(
    { _id: ObjectId(_id) },
    {
      $set: {
        ...metric,
        idTactic: ObjectId(metric.idTactic),
        updatedAt: Date.now(),
      },
    },
    {
      returnDocument: 'after',
    }
  )
  client.close()
  return editedMetric
}

/**
 * Delete a metric
 * @param {String} _id metric id
 * @returns deleted metric
 */
export async function deleteMetric(_id) {
  const client = await connectToDatabase()
  const db_instance = client.db()

  const collection = await db_instance.collection(METRIC_COLLECTION)
  const deletedMetric = await collection.deleteOne({ _id: ObjectId(_id) })
  client.close()
  return deletedMetric
}

/**
 * Returns all metrics by case model
 * @param {String} idCaseModel
 * @returns
 */
export async function allMetricsByCaseModel(idCaseModel) {
  let client
  try {
    client = await connectToDatabase()
    const db_instance = client.db()

    // obtain tactics from case modeler
    const tacticCollection = await db_instance.collection(TACTIC_COLLECTION)
    const tactics = await tacticCollection.find({ idCaseModel: ObjectId(idCaseModel) }).toArray()

    // obtain metrics for each tactic
    const metrics = await Promise.all(
      tactics.map(async (tactic) => {
        return await allMetrics(tactic._id)
      })
    )

    const metricsFlat = metrics.flat()

    return metricsFlat
  } catch (error) {
    console.error(error)
    throw new Error('Failed to fetch metrics by case model')
  } finally {
    if (client) {
      client.close()
    }
  }
}
