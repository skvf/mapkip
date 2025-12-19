import { getRunningInstances } from '../../../lib/runningInstance'

export default async function handler(req, res) {
  const runningInstances = await getRunningInstances({ ...req.query })
  res.status(200).json(runningInstances)
}
