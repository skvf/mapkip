import { queue } from '../../../lib/planner'

export default async function handler(req, res) {
  const planner = await queue()
  res.status(200).json(planner)
}
