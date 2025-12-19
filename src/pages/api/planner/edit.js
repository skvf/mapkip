import { updatePlanner } from '../../../lib/planner'

export default async function handler(req, res) {
  const data = req.body

  const updatedPlanner = await updatePlanner(data)
  res.status(200).json(updatedPlanner)
}
