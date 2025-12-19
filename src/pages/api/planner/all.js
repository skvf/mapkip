import { allPlanners } from '../../../lib/planner'

export default async function handler(req, res) {
  const planners = await allPlanners(req.query)
  res.json(planners)
}
