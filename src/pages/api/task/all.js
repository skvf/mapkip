import { allTasks } from '../../../lib/task'

export default async function handler(req, res) {
  const data = req.body
  const tasks = await allTasks(data.idTactic)
  res.json(tasks)
}
