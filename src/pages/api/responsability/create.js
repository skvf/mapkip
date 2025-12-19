import { createResponsability } from '../../../lib/responsability'

export default async function handler(req, res) {
  const data = req.body
  const newResponsability = await createResponsability(data.idRole, data.name)
  res.json(newResponsability)
}
