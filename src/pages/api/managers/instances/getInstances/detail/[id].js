export default function handler(req, res) {
  const InstanceDetail = {
    _id: '00001',
    name: 'Oncology',
    artifacts: [
      {
        _id: 'hshdjsajhdgahs',
        name: 'Personal',
        items: [
          {
            _id: 'hshdjsajhdgahs',
            _type: 'number',
            value: 1,
            name: 'Case Instance ID',
          },
          {
            _id: 'sbdhsghdgas',
            _type: 'string',
            value: 'Maria Valverde',
            name: 'Name',
          },
          {
            _id: 'jshdjashjda',
            _type: 'number',
            value: 61,
            name: 'Age',
          },
          {
            _id: 'jshdjashjda',
            _type: 'string',
            value: 'Female',
            name: 'Sex',
          },
        ],
      },
    ],
  }

  res.json(InstanceDetail)
}
