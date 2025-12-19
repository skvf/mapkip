import { editPermission } from '../../../lib/permission'

export default async function handler(req, res) {
  const data = req.body
  const permission = await editPermission(data)
  res.json(permission)
}
