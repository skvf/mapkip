import { getReponsability } from '../../../lib/responsability'

export default async function handler(req, res) {
  const data = req.body
  const responsability = await getReponsability(data._id)
  res.json(responsability)
}
