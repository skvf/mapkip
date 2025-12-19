import { getTask } from '../../../lib/task'

export default async function handler(req, res) {
  const data = req.body
  const task = await getTask(data._id)
  res.json(task)
}
