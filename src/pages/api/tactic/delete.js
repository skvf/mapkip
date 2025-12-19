import { deleteTactic } from '../../../lib/tactic'

export default async function handler(req, res) {
  const data = req.body
  const tactic = await deleteTactic(data._id)
  res.json(tactic)
}
