import { editTask } from '../../../lib/task'

export default async function handler(req, res) {
  const data = req.body
  const task = await editTask(data)
  res.json(task)
}
