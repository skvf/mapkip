import { analyzeInstance } from '../../../lib/runningInstance'

export default async function handler(req, res) {
  const preconditions = await analyzeInstance(req.body._id)
  res.status(200).json(preconditions)
}
