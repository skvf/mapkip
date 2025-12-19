import { deleteGoal } from '../../../lib/goal'

export default async function handler(req, res) {
  const { _id } = req.body
  const deletedGoal = await deleteGoal(_id)
  res.status(200).json(deletedGoal)
}
