import { getMetric } from '../../../lib/metric'

export default async function handler(req, res) {
  const { _id } = req.body
  const metric = await getMetric(_id)
  res.status(200).json(metric)
}
