import { createCapability } from '../../../lib/capability'

export default async function handler(req, res) {
  const data = req.body
  const newCapability = await createCapability(data.idRole, data.name)
  res.json(newCapability)
}
