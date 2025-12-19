import { editReponsability } from '../../../lib/responsability'

export default async function handler(req, res) {
  const data = req.body
  const responsability = await editReponsability(data)
  res.json(responsability)
}
