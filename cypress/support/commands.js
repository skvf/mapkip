// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

const WAIT_DEFAULT = 5_000
const WAIT_SHORT = WAIT_DEFAULT / 2

Cypress.Commands.add('givenACaseModel', () => {
  cy.visit('/modeling')
  cy.wait(WAIT_DEFAULT)

  cy.get('[data-testid="btn-create-new-case-model"').click()
  cy.wait(WAIT_DEFAULT)

  // cy get current url
  cy.url().then((url) => {
    cy.log('Current URL: ' + url)

    // get last item of url splited by /
    const lastSegment = url.split('/').pop()
    cy.log('CaseModelId: ' + lastSegment)

    // save last segment
    cy.setCookie('CaseModelId', lastSegment)
  })

  cy.get('[data-testid="btn-add-artifacts"').click()
  cy.wait(WAIT_DEFAULT * 2)

  cy.get('[data-testid="btn-add-new-item"]').click()
  cy.wait(WAIT_DEFAULT)

  cy.get('[data-testid="btn-add-new-attribute"').click()
  cy.wait(WAIT_DEFAULT)

  // cy go back
  cy.go('back')
})

Cypress.Commands.add('givenATactic', () => {
  cy.givenACaseModel()

  cy.get('[data-testid="btn-add-tactics"]').click()
  cy.wait(WAIT_SHORT)
})

Cypress.Commands.add('givenOneAttributeOfTypeNumeric', () => {
  cy.givenACaseModel()

  cy.get('[data-testid="btn-add-artifacts"').click()
  cy.wait(WAIT_DEFAULT)

  cy.get('[data-testid="btn-add-new-item"]').click()
  cy.wait(WAIT_DEFAULT)

  cy.get('[data-testid="btn-add-new-attribute"').click()
  cy.wait(WAIT_DEFAULT)

  cy.get('[data-testid="btn-edit-attribute"]').click()
  // select attribute type with value "integer"
  cy.get('[data-testid="select-attribute-type"]').select('Integer')

  // set min and max range
  cy.get('[data-testid="input-min-range"]').type('0')
  cy.get('[data-testid="input-max-range"]').type('100')

  // set normal range
  cy.get('[data-testid="input-min-normal-range"]').type('25')
  cy.get('[data-testid="input-max-normal-range"]').type('75')

  // save
  cy.get('[data-testid="btn-save-attribute"]').click()

  cy.go('back')
  cy.wait(WAIT_DEFAULT)
})

Cypress.Commands.add('deleteCurrentCaseModel', () => {
  // retrieve cy.env value
  cy.getCookie('CaseModelId').then((cookie) => {
    cy.log('Fake Deleted CaseModelId: ' + cookie.value)
    cy.request({
      method: 'POST',
      url: `/api/caseModel/delete`,
      body: {
        _id: cookie.value,
      },
    })
  })
})
