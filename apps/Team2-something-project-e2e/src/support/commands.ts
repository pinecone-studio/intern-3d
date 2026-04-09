/// <reference types="cypress" />

declare module 'cypress' {
  interface Chainable {
    login(email: string, password: string): void;
  }
}

Cypress.Commands.add('login', (email, password) => {
  console.log('Custom command example: Login', email, password);
});
