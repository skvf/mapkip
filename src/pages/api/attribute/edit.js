import { editAttribute } from '../../../lib/attribute'

export default async function handler(req, res) {
  const data = req.body
  const attribute = await editAttribute(data)
  res.json(attribute)
}
