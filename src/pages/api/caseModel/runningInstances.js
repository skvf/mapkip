import { getRunningInstances } from '../../../lib/caseModel'

export default async function handler(req, res) {
  const data = await getRunningInstances()
  res.json(data)
}
