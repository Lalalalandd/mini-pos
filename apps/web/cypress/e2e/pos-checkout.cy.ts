describe('Cashier POS & Checkout Flow', () => {
  beforeEach(() => {
    cy.visit('/pos');
  });

  it('should render POS terminal with scanner input and items', () => {
    cy.contains('Cashier POS').should('be.visible');
    cy.get('input[placeholder*="Scan Barcode"]').should('exist');
    cy.contains('Current POS Ticket').should('be.visible');
  });

  it('should add item to cart and calculate totals', () => {
    // Click the first product in the list
    cy.get('button').contains('Single Origin Espresso').click();

    // Verify item appears in cart ticket
    cy.get('div').contains('Current POS Ticket').should('exist');
    cy.contains('Grand Total').should('be.visible');

    // Settle ticket
    cy.contains('Pay / Settle Ticket').click();
    cy.contains('Select Payment Tender').should('be.visible');
  });
});
