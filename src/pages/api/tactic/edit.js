import { editTactic } from '../../../lib/tactic'

export default async function handler(req, res) {
  const data = req.body
  const tactic = await editTactic(data)
  res.json(tactic)
}
