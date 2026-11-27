import { test, expect } from '@playwright/test';

test('setup and language navigation work without Intl.DisplayNames, as on Hermes', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(Intl, 'DisplayNames', { value: undefined, configurable: true });
  });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Light', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Favorite languages', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'German — Deutsch', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search', exact: true }).fill('German');
  await page.getByRole('button', { name: 'German — Deutsch', exact: true }).last().click();
  await expect(
    page.getByRole('button', { name: 'Patient language: German', exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
