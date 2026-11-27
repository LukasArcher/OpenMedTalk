import { test, expect } from '@playwright/test';
test('synthetic mobile workflow, literal log, draft localization and session clearing', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(page.getByText('Patient language', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/screens/picker-light.png', fullPage: true });
  await page.getByRole('button', { name: 'Danish — Dansk', exact: true }).last().click();
  await expect(page.getByText('Heart', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/screens/categories-light.png', fullPage: true });
  await page.getByText('Heart', { exact: true }).click();
  await page.getByRole('textbox', { name: 'Search', exact: true }).fill('Do you have chest pain?');
  await page.getByRole('button', { name: 'Do you have chest pain?', exact: true }).click();
  await expect(page.getByText('Har du smerter i brystet?', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ja', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Nej', exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/screens/patient-bool-da.png', fullPage: true });
  await page.getByTestId('patient-question').click();
  await expect(page.getByTestId('patient-question')).toContainText('Do you have chest pain?');
  await page.getByRole('button', { name: 'Ja', exact: true }).click();
  await page.getByRole('button', { name: 'Log', exact: true }).click();
  await page.getByRole('button', { name: 'Chronological', exact: true }).click();
  await expect(page.getByText('Do you have chest pain?', { exact: true }).last()).toBeVisible();
  await expect(page.getByText('Yes', { exact: true }).last()).toBeVisible();
  await page.screenshot({ path: 'test-results/screens/log-light.png', fullPage: true });
  await page.getByRole('button', { name: 'Transfer', exact: true }).click();
  await page.getByRole('button', { name: 'Show QR', exact: true }).click();
  await expect(page.locator('svg').last()).toBeVisible();
  await page.screenshot({ path: 'test-results/screens/transfer-light.png', fullPage: true });
  await page.reload();
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Resume session', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  await expect(page.getByTestId('screen').last()).toHaveCSS('background-color', 'rgb(21, 27, 30)');
  await page.screenshot({ path: 'test-results/screens/settings-dark.png', fullPage: true });
  await page.reload();
  await expect(page.getByTestId('screen').last()).toHaveCSS('background-color', 'rgb(21, 27, 30)');
  expect(errors).toEqual([]);
});
