import { getGoals } from '../../../lib/goal'

export default async function handler(req, res) {
  const { idTactic } = req.body
  const goals = await getGoals(idTactic)
  res.status(200).json(goals)
}
