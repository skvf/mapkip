import { allReponsabilities } from '../../../lib/responsability'

export default async function handler(req, res) {
  const data = req.body
  const responsabilities = await allReponsabilities(data.idRole)
  res.json(responsabilities)
}
