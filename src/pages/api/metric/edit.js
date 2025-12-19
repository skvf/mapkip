import { editMetric } from '../../../lib/metric'

export default async function handler(req, res) {
  const data = req.body
  const metric = await editMetric(data)
  res.status(200).json(metric)
}
