import { deleteItem } from '../../../lib/item'

export default async function handler(req, res) {
  const data = req.body
  const item = await deleteItem(data._id)
  res.json(item)
}
