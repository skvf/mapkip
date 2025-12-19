import { createPrecondition } from '../../../lib/precondition'

export default async function handler(req, res) {
  const newPrecondition = await createPrecondition(req.body)
  res.status(200).json(newPrecondition)
}
