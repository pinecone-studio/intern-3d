/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    login(email: string, password: string): void;
  }
}

Cypress.Commands.add('login', (email, password) => {
  console.log('Custom command example: Login', email, password);
});
