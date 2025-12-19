import { editItem } from '../../../lib/item'

export default async function handler(req, res) {
  const data = req.body
  const item = await editItem(data)
  res.json(item)
}
