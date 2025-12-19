import { editEvent } from '../../../lib/event'

export default async function handler(req, res) {
  const data = req.body
  const event = await editEvent(data)
  res.status(200).json(event)
}
