import { createItem } from '../../../lib/item'

export default async function handler(req, res) {
  const data = req.body
  const newItem = await createItem(data.idArtifact)
  res.json(newItem)
}
