import React from 'react';
import { render, screen } from '@testing-library/react';
import Page from '../src/app/page';

describe('Page', () => {
  it('should render successfully', () => {
    render(<Page />);

    expect(
      screen.getByRole('heading', { name: /make club registration simple/i })
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: /browse clubs/i })).toBeTruthy();
  });
});
