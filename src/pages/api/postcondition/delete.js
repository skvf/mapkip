import { deletePostcondition } from '../../../lib/postcondition'

export default async function handler(req, res) {
  const result = await deletePostcondition(req.body._id)
  res.status(200).json(result)
}
