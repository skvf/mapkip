import { setCriticals } from '../../../lib/attribute'

export default async function handler(req, res) {
  const data = req.body
  const attributes = await setCriticals(data)
  res.json(attributes)
}
