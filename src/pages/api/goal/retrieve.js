import { getGoal } from '../../../lib/goal'

export default async function handler(req, res) {
  const { _id } = req.body
  const goal = await getGoal(_id)
  res.status(200).json(goal)
}
