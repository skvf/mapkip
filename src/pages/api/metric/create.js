import { createMetric } from '../../../lib/metric'

export default async function handler(req, res) {
  const { idTactic } = req.body
  const metric = await createMetric(idTactic)
  res.status(200).json(metric)
}
