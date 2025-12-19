import { deletePrecondition } from '../../../lib/precondition'

export default async function handler(req, res) {
  const { _id } = req.body
  const deletedPrecondition = await deletePrecondition(_id)
  res.status(200).json(deletedPrecondition)
}
