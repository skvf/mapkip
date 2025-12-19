import { allMetrics } from '../../../lib/metric'

export default async function handler(req, res) {
  const { idTactic, params } = req.body
  const metric = await allMetrics(idTactic, params)
  res.status(200).json(metric)
}
