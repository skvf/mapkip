import { allComments } from '../../../lib/comment'
export default async function handler(req, res) {
  const data = req.body
  const comments = await allComments(data.idPlanner)

  res.json(comments)
}
