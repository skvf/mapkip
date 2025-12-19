import { editRole } from '../../../lib/role'

export default async function handler(req, res) {
  const data = req.body
  const role = await editRole(data)
  res.json(role)
}
