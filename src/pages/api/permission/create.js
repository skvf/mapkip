import { createPermission } from '../../../lib/permission'

export default async function handler(req, res) {
  const data = req.body
  const newPermission = await createPermission(data.idRole, data.name)
  res.json(newPermission)
}
