import { createComment } from '../../../lib/comment'

export default async function handler(req, res) {
  const data = req.body
  const newComment = await createComment({
    idPlanner: data.idPlanner,
    text: data.text,
  })
  res.json(newComment)
}
