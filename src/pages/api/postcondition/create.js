import { createPostCondition } from '../../../lib/postcondition'

export default async function handler(req, res) {
  const newPostcondition = await createPostCondition(req.body)
  res.status(200).json(newPostcondition)
}
