import { getPreconditionsByAttributeId } from '../../../lib/precondition'

export default async function handler(req, res) {
  const preconditions = await getPreconditionsByAttributeId(req.body.idAttribute)
  res.status(200).json(preconditions)
}
