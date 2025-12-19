const instances = [
  { id: 1, caseTypeId: 1, status: 'initiated', changed: '10/04/21' },

  { id: 2, caseTypeId: 1, status: 'active', changed: '20/04/21' },

  { id: 3, caseTypeId: 1, status: 'suspended', changed: '15/04/21' },

  { id: 4, caseTypeId: 1, status: 'compleated', changed: '20/04/21' },

  { id: 5, caseTypeId: 1, status: 'active', changed: '21/04/21' },

  { id: 6, caseTypeId: 2, status: 'compleated', changed: '20/04/21' },

  { id: 7, caseTypeId: 2, status: 'active', changed: '21/04/21' },
]

export default function getInstances(req, res) {
  const caseTypeId = req.query.caseTypeId
  console.log('getting instances of caseTypeId ', caseTypeId)

  res.json({ instances: instances.filter((instance) => instance.caseTypeId == caseTypeId) })
}
