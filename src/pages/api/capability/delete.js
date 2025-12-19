import { deleteCapability } from '../../../lib/capability'

export default async function handler(req, res) {
  const data = req.body
  const capability = await deleteCapability(data._id)
  res.json(capability)
}
