import { PLANNER_STATUS, getPlanner, updatePlanner } from '../../../lib/planner'

export default async function handler(req, res) {
  const { body } = req
  const { _id } = body
  await updatePlanner({
    _id,
    status: PLANNER_STATUS.ON_QUEUE,
    queueAt: Date.now(),
  })

  const planner = await getPlanner(_id)
  res.status(200).json(planner)
}
