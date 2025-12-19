import { allItems } from '../../../lib/item'

export default async function handler(req, res) {
  const data = req.body
  const items = await allItems(data.idArtifact)
  res.json(items)
}
