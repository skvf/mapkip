import { getStep } from '../../../lib/step'

export default async function handler(req, res) {
  const { _id } = req.body
  const step = await getStep(_id)
  res.status(200).json(step)
}
