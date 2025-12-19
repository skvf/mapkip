import { updateValues } from '../../../lib/runningInstance'

export default async function handler(req, res) {
  const runningInstance = await updateValues(req.body)
  res.status(200).json(runningInstance)
}
