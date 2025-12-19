import { createTask } from '../../../lib/task'

export default async function handler(req, res) {
  const data = req.body
  const newTask = await createTask(data.idTactic)
  res.json(newTask)
}
