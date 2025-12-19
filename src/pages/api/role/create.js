import { createRole } from '../../../lib/role'

export default async function handler(req, res) {
  const data = req.body
  const newRole = await createRole(data.idCaseModel)
  res.json(newRole)
}
