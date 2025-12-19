import { allTactics } from '../../../lib/tactic'

export default async function handler(req, res) {
  const data = req.body
  const tactics = await allTactics(data.idCaseModel)
  res.json(tactics)
}
