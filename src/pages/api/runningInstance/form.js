import { getForm } from '../../../lib/runningInstance'

export default async function handler(req, res) {
  const { _id } = req.body
  const form = await getForm(_id)
  res.status(200).json(form)
}
