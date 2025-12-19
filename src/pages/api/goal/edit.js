import { editGoal } from '../../../lib/goal'

export default async function handler(req, res) {
  const { _id, ...goal } = req.body
  const updatedGoal = await editGoal({ _id, ...goal })
  res.status(200).json(updatedGoal)
}
