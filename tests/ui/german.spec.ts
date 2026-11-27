import { test, expect } from '@playwright/test';
import { ui } from '../../packages/translations/ui';
import { patientText } from '../../packages/translations/patient';
import { itemById } from '../../packages/clinical/catalog';

test('German draft stays independent of clinician language and produces literal localized logs', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const item = itemById('thorax_001');
  const sourceQuestion = patientText(item.id, item.sourceVersion, 'da');
  const germanQuestion = patientText(item.id, item.sourceVersion, 'de');
  await page.goto('/');
  await page.getByRole('button', { name: 'Dansk', exact: true }).click();
  await page.getByRole('button', { name: ui.da.continue, exact: true }).click();
  await page.getByRole('button', { name: ui.da.continue, exact: true }).click();
  await page.getByRole('button', { name: ui.da.done, exact: true }).click();
  await page
    .getByRole('button', { name: /— Deutsch$/ })
    .last()
    .click();
  await page.getByRole('button', { name: ui.da.search, exact: true }).click();
  await page.getByRole('textbox', { name: ui.da.search, exact: true }).fill(sourceQuestion);
  await page.getByRole('button', { name: sourceQuestion, exact: true }).click();
  await expect(page.getByTestId('patient-question')).toContainText(germanQuestion);
  await expect(page.getByText(ui.de.draft, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Nein', exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/screens/patient-bool-de.png', fullPage: true });
  await page.getByTestId('patient-question').click();
  await expect(page.getByTestId('patient-question')).toContainText(sourceQuestion);
  await page.getByRole('button', { name: 'Nein', exact: true }).click();
  await page.getByRole('button', { name: ui.da.log, exact: true }).click();
  await page.getByRole('button', { name: ui.da.all, exact: true }).click();
  await expect(page.getByText(sourceQuestion, { exact: true }).last()).toBeVisible();
  await expect(page.getByText(ui.da.no, { exact: true }).last()).toBeVisible();
  await page.goto('/settings');
  await page.getByRole('button', { name: 'Deutsch', exact: true }).click();
  await expect(page.getByText(ui.de.settings, { exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/screens/settings-de.png', fullPage: true });
  await page.getByRole('button', { name: ui.de.back, exact: true }).click();
  await page
    .getByRole('button', { name: /— Dansk$/ })
    .last()
    .click();
  await page.getByRole('button', { name: ui.de.search, exact: true }).click();
  await page.getByRole('textbox', { name: ui.de.search, exact: true }).fill(germanQuestion);
  await page.getByRole('button', { name: germanQuestion, exact: true }).click();
  await expect(page.getByTestId('patient-question')).toContainText(sourceQuestion);
  await expect(page.getByRole('button', { name: ui.da.no, exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
