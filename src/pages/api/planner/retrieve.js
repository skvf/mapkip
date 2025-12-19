import { getPlanner } from '../../../lib/planner'

export default async function handler(req, res) {
  const { _id } = req.body
  const planner = await getPlanner(_id)
  res.status(200).json(planner)
}
