import { createStep } from '../../../lib/step'

export default async function handler(req, res) {
  const { idTactic, idTask } = req.body
  const step = await createStep({ idTactic, idTask })
  res.status(200).json(step)
}
