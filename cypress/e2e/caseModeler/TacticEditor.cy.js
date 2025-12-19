it("should show error message when there's no attribute of type numeric", () => {
  cy.givenACaseModel().then(() => {
    // when create a new tactic

    cy.get('[data-testid="btn-add-tactics"]').click()
    cy.wait(5_000)

    // then show error message
    cy.get('[data-testid=alert-no-attribute]').should('contain', 'Add attribute of numeric type')
  })
})
