import { getPreconditionsByTacticOrStepId } from '../../../lib/precondition'

export default async function handler(req, res) {
  const preconditions = await getPreconditionsByTacticOrStepId(req.body)
  res.status(200).json(preconditions)
}
