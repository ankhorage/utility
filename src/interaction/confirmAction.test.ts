import { expect, test } from 'bun:test';

import { confirmAction } from './confirmAction.js';
import type { ConfirmationButton, ConfirmationRequest } from './types.js';

const REQUEST: ConfirmationRequest = {
  title: 'Delete project',
  message: 'Delete Release Monitor?',
  confirmText: 'Delete',
  destructive: true,
};

test('web cancellation does not fall through to fallback alert', () => {
  let confirmed = false;
  let alerted = false;

  confirmAction(
    REQUEST,
    {
      preferConfirm: true,
      confirm: () => false,
      alert: () => {
        alerted = true;
      },
    },
    () => {
      confirmed = true;
    },
  );

  expect(confirmed).toBe(false);
  expect(alerted).toBe(false);
});

test('web confirmation runs the action without fallback alert', () => {
  let confirmed = false;
  let alerted = false;

  confirmAction(
    REQUEST,
    {
      preferConfirm: true,
      confirm: () => true,
      alert: () => {
        alerted = true;
      },
    },
    () => {
      confirmed = true;
    },
  );

  expect(confirmed).toBe(true);
  expect(alerted).toBe(false);
});

test('fallback confirmation only runs after destructive alert action', () => {
  let confirmed = false;
  let buttons: readonly ConfirmationButton[] = [];

  confirmAction(
    REQUEST,
    {
      alert: (_title, _message, nextButtons) => {
        buttons = nextButtons ?? [];
      },
    },
    () => {
      confirmed = true;
    },
  );

  expect(confirmed).toBe(false);
  expect(buttons).toHaveLength(2);
  buttons.find((button) => button.style === 'destructive')?.onPress?.();
  expect(confirmed).toBe(true);
});
