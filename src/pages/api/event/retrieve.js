import { getEvent } from '../../../lib/event'

export default async function handler(req, res) {
  const { _id } = req.body
  const event = await getEvent(_id)
  res.status(200).json(event)
}
