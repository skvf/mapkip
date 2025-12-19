import { getAttribute } from '../../../lib/attribute'

export default async function handler(req, res) {
  const data = req.body
  const attribute = await getAttribute(data._id)
  res.json(attribute)
}
