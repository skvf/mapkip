const types = [
  {
    id: '1',
    name: 'Oncology',
  },
  {
    id: '2',
    name: 'Cardiology',
  },
]

export default function handler(req, res) {
  res.json({ types })
}
