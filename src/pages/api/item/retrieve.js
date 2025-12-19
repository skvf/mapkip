import { getItem } from '../../../lib/item'

export default async function handler(req, res) {
  const data = req.body
  const item = await getItem(data._id)
  res.json(item)
}
