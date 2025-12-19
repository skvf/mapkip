// dado que o usuário está na página de edição de um passo
// quando ele clica no botão "Deterministic" e depois no botão "Add Effect"
// então o efeito é adicionado com a probabilidade 1

// it("Add Effect with probability 1", () => {
//     cy.givenATactic();

//     // to continue...

//     // cy.get('[data-testid="post-condition-modify-attribute-yes"]').click();
//     // cy.get('[data-testid="btn-add-effect"]').click();

//     // cy.get('.toast-header').contains("Success");
//     // cy.get('.toast-body').contains("Postcondition effect created successfully");
// });

describe('Step Editor - Effects and Preconditions', () => {
  it('should save effect with single button', () => {
    cy.givenOneAttributeOfTypeNumeric().then(() => {
      cy.get('[data-testid="btn-add-tactics"]').click()

      // ADD STEP
      cy.get('[data-testid="btn-add-step"]').click()
      cy.get('[data-testid="post-condition-modify-attribute-yes"]', {
        timeout: 15_000,
      }).click()

      // set undeterministic
      cy.get('[data-testid="post-condition-undeterministic"]', {
        timeout: 15_000,
      }).click()

      // adiciona dois efeitos

      cy.get('[data-testid="btn-add-effect"]', { timeout: 15_000 }).click()
      cy.get('[data-testid="btn-add-effect"]', { timeout: 15_000 }).click()

      // edito o nome dos dois efeitos
      cy.get('[data-testid="input-effect-name"]').eq(0).clear().type('Effect 1')
      cy.get('[data-testid="input-effect-name"]').eq(1).clear().type('Effect 2')

      // quando salva e dou refresh
      // os dois efeitos devem ser editados
    })
  })

  it('should preconditions shows when delete one', () => {
    cy.givenOneAttributeOfTypeNumeric().then(() => {
      cy.get('[data-testid="btn-add-tactics"]').click()
      cy.wait(500)

      // ADD STEP
      cy.get('[data-testid="btn-add-step"]').click()

      // use Cypress' built-in retry: wait up to 15s for the radio to be visible/enabled, then click
      cy.get('#yes-option-radio-button', { timeout: 15_000 })
        .should('be.visible')
        .and('not.be.disabled')
        .click()

      // add dois preconditions
      // preencha valor 1
      cy.get('[data-testid="input-precondition-value"]', {
        timeout: 15_000,
      }).type('25')
      cy.get('[data-testid="btn-save-precondition"]').click()

      // preencha valor 2
      cy.get('[data-testid="input-precondition-value"]').type('30')
      cy.get('[data-testid="btn-save-precondition"]').click()

      // quando salva e dou refresh
      // os dois efeitos devem ser editados

      cy.get('[data-testid="btn-delete-precondition"]').first().click()
      cy.reload()

      cy.get('[data-testid="precondition-0"]', {
        timeout: 15_000,
      }).should('have.text', 'CODE = 30 Unit of measures')
    })
  })

  it('should keep other preconditions of the step when one is deleted', () => {
    cy.givenOneAttributeOfTypeNumeric().then(() => {
      cy.get('[data-testid="btn-add-tactics"]').click()

      cy.get('[data-testid="input-precondition-value"]', {
        timeout: 15_000,
      }).type('24')
      cy.get('[data-testid="btn-save-precondition"]').click()

      // ADD STEP
      cy.get('[data-testid="btn-add-step"]').click()

      // use Cypress' built-in retry: wait up to 15s for the radio to be visible/enabled, then click
      cy.get('#yes-option-radio-button', { timeout: 15_000 })
        .should('be.visible')
        .and('not.be.disabled')
        .click()

      // add two preconditions
      // fill value 1
      cy.get('[data-testid="input-precondition-value"]', {
        timeout: 15_000,
      }).type('25')
      cy.get('[data-testid="btn-save-precondition"]').click()

      // fill value 2
      cy.get('[data-testid="input-precondition-value"]').type('30')
      cy.get('[data-testid="btn-save-precondition"]').click()

      // when saved and I refresh
      // the two effects should be edited

      cy.get('[data-testid="btn-delete-precondition"]').first().click()

      cy.get('[data-testid="precondition-0"]', {
        timeout: 15_000,
      }).should('have.text', 'CODE = 30 Unit of measures')
    })
  })

  // after all test exec command deleteCurrentCaseModel
  afterEach(() => {
    cy.deleteCurrentCaseModel()
  })
})
