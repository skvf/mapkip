import { getTactic } from '../../../lib/tactic'

export default async function handler(req, res) {
  const data = req.body
  const tactic = await getTactic(data._id)
  res.json(tactic)
}
