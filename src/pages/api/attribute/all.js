import { allAttributes } from '../../../lib/attribute'

export default async function handler(req, res) {
  const data = req.body
  const attributes = await allAttributes(data.idItem)
  res.json(attributes)
}
