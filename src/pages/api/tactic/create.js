import { createTactic } from '../../../lib/tactic'

export default async function handler(req, res) {
  const data = req.body
  const newTactic = await createTactic(data.idCaseModel)
  res.json(newTactic)
}
