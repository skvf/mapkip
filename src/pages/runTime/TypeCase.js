import Header from '../../components/Header'

export default function TypeCasePage(props) {
  const headers = ['TypeCase Id', 'Name', 'Running instances']

  const rows = [
    { id: 1, type: 'oncology', instances: 1 },
    { id: 2, type: 'oncology', instances: 1 },
    { id: 3, type: 'oncology', instances: 1 },
    { id: 4, type: 'oncology', instances: 1 },
    { id: 5, type: 'oncology', instances: 1 },
  ]

  return (
    <>
      <Header env="runtime"> </Header>
      <div class="container">
        {' '}
        <h1>Executing Cases</h1>
        <table className="table table-hover table-striped">
          <thead>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </thead>
          <tbody>
            {rows.map((row) => {
              return (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.type}</td>
                  <td>{row.instances}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
