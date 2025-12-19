import { editStep } from '../../../lib/step'

export default async function handler(req, res) {
  const data = req.body
  const step = await editStep(data)
  res.status(200).json(step)
}
