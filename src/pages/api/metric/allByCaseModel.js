import { allMetricsByCaseModel } from '../../../lib/metric'

export default async function handler(req, res) {
  const data = req.body
  const metrics = await allMetricsByCaseModel(data.idCaseModel)
  res.json(metrics)
}
