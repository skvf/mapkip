import { updatePostcondition } from '../../../lib/postcondition'

export default async function handler(req, res) {
  const result = await updatePostcondition(req.body)
  res.status(200).json(result)
}
