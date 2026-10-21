import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';

// Jest z CRA (v27) neumí "exports" v package.json, takže tuhle cestu nenajde.
// Analytiku v testech stejně nechceme – nahradíme ji prázdnou komponentou.
jest.mock('@vercel/analytics/react', () => ({ Analytics: () => null }), { virtual: true });

const STORAGE_KEY = 'beerPongMatch';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  jest.useRealTimers();
});

function startMatch1v1() {
  fireEvent.change(screen.getAllByLabelText('Player 1')[0], { target: { value: 'Alice' } });
  fireEvent.change(screen.getAllByLabelText('Player 1')[1], { target: { value: 'Bob' } });
  // Premier League je defaultně zapnutá – pro test ji vypneme, ať nemusíme vybírat ligu
  fireEvent.click(screen.getByLabelText('Premier League?'));
  fireEvent.click(screen.getByRole('button', { name: 'Start Counter' }));
}

test('bez jmen hráčů nejde zápas spustit', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: 'Start Counter' })).toBeDisabled();
});

test('hit se započítá a undo ho vrátí', () => {
  render(<App />);
  startMatch1v1();

  fireEvent.click(screen.getAllByRole('button', { name: 'Hit' })[0]);
  expect(screen.getAllByText('Hits: 1 | Total: 1 | 100.0%')).toHaveLength(1);

  fireEvent.click(screen.getByRole('button', { name: /Undo/ }));
  expect(screen.getAllByText('Hits: 0 | Total: 0 | 0.0%')).toHaveLength(2);
});

test('časovač po obnovení stránky pokračuje, nezačíná znovu', () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-06-15T20:00:00Z'));

  const { unmount } = render(<App />);
  startMatch1v1();
  expect(screen.getByText('10:00')).toBeInTheDocument();

  // "Obnovení stránky" o 3 minuty později: nová instance appky ze stejného localStorage
  unmount();
  jest.setSystemTime(new Date('2025-06-15T20:03:00Z'));
  render(<App />);

  expect(screen.getByText('07:00')).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY) as string).timer.phase).toBe('base');
});

test('po vypršení základního času se přepne na 20 s na hod', () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-06-15T20:00:00Z'));

  render(<App />);
  startMatch1v1();

  act(() => {
    jest.setSystemTime(new Date('2025-06-15T20:10:01Z'));
    jest.advanceTimersByTime(500);
  });
  fireEvent.click(screen.getByRole('button', { name: 'Got it!' }));

  expect(screen.getByText('00:20')).toBeInTheDocument();
});
