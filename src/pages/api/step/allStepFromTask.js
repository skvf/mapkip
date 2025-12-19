import { allStepsFromTask } from '../../../lib/step'

export default async function handler(req, res) {
  const { idTask } = req.body
  const steps = await allStepsFromTask(idTask)
  res.status(200).json(steps)
}
