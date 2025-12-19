import { createAttribute } from '../../../lib/attribute'

export default async function handler(req, res) {
  const data = req.body
  const newAttribute = await createAttribute(data.idItem)
  res.json(newAttribute)
}
