import { createRunningInstance } from '../../../lib/runningInstance'

export default async function handler(req, res) {
  const { idCaseModel } = req.body
  const runningInstance = await createRunningInstance(idCaseModel)
  res.status(201).json(runningInstance)
}
