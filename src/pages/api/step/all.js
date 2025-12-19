import { allSteps } from '../../../lib/step'

export default async function handler(req, res) {
  const { idTactic } = req.body
  const steps = await allSteps(idTactic)
  res.status(200).json(steps)
}
