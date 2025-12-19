import { deleteReponsability } from '../../../lib/responsability'

export default async function handler(req, res) {
  const data = req.body
  const responsability = await deleteReponsability(data._id)
  res.json(responsability)
}
