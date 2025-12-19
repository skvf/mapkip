import { createGoal } from '../../../lib/goal'

export default async function handler(req, res) {
  const newGoal = await createGoal(req.body)
  res.status(201).json(newGoal)
}
