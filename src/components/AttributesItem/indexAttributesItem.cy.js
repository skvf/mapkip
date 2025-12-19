import AttributesItem from './index'

describe.skip('<AttributesItem />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<AttributesItem idItem={0} />)
  })
})
