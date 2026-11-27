import { test, expect, type Page } from '@playwright/test';
import seed from '../../docs/clinical/source-library-v0.2.draft.json';
import { encodeTransfer } from '../../packages/transfer/index';
import { createEvent } from '../../packages/clinical/session';
async function setup(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Done', exact: true }).click();
}
test('every v0.2 response template requires explicit input and logs no instruction acknowledgement', async ({
  page,
}) => {
  test.setTimeout(180000);
  await setup(page);
  await page.getByRole('button', { name: 'English — English', exact: true }).last().click();
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByRole('button', { name: 'Optional questions', exact: true }).click();
  for (const type of Object.keys(seed.responseTypes)) {
    const item = seed.items.find((i) => i.responseType === type)!;
    await page.getByRole('textbox', { name: 'Search', exact: true }).fill(item.source.en.text);
    await page.getByRole('button', { name: item.source.en.text, exact: true }).click();
    if (type === 'info') {
      await expect(page.getByRole('button', { name: 'Confirm', exact: true })).toHaveCount(0);
      await page.getByRole('button', { name: 'Close', exact: true }).click();
      continue;
    }
    if (type === 'bool') {
      await page.getByRole('button', { name: 'Yes', exact: true }).click();
      continue;
    }
    await page.getByRole('button', { name: 'Confirm', exact: true }).click();
    await expect(
      page.getByText('Invalid value. Check the value and unit.', { exact: true }),
    ).toBeVisible();
    if (type === 'body') {
      await page.getByTestId('body-map').click({ position: { x: 24, y: 218 } });
      await page.getByRole('button', { name: 'Back', exact: true }).last().click();
      await page.getByTestId('body-map').click({ position: { x: 176, y: 218 } });
      await expect(page.getByText('Back: Right hand', { exact: true })).toBeVisible();
    } else if (type === 'nrs') {
      await page.getByRole('button', { name: '7', exact: true }).click();
    } else if (type === 'onset_interval') {
      await page.getByRole('button', { name: '1–6 hours ago', exact: true }).click();
    } else if (type === 'date') {
      await page
        .getByRole('textbox', { name: 'Date (YYYY-MM-DD)', exact: true })
        .fill('2026-01-01');
    } else {
      await page
        .getByRole('textbox', { name: 'Value', exact: true })
        .fill(type === 'temperature' ? '37.2' : '2');
      const spec = seed.responseTypes[type as keyof typeof seed.responseTypes];
      if ('units' in spec)
        await page.getByRole('button', { name: spec.units[0]!.label.en, exact: true }).click();
    }
    if (['body', 'nrs', 'onset_interval', 'count'].includes(type))
      await page.screenshot({ path: `test-results/screens/response-${type}.png`, fullPage: true });
    await page.getByRole('button', { name: 'Confirm', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Search', exact: true })).toBeVisible();
  }
  const timed = seed.items.find((i) => i.responseType === 'elapsed')!;
  await page.getByRole('textbox', { name: 'Search', exact: true }).fill(timed.source.en.text);
  await page.getByRole('button', { name: timed.source.en.text, exact: true }).click();
  await page.getByRole('button', { name: 'Local date/time', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Local date/time (YYYY-MM-DDTHH:mm)', exact: true })
    .fill('2026-01-01T10:30');
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await page.getByRole('button', { name: 'Log', exact: true }).click();
  await page.getByRole('button', { name: 'Chronological', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Edit', exact: true })).toHaveCount(16);
  await expect(page.getByText('2026-01-01T10:30', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Undo last answer', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Edit', exact: true })).toHaveCount(15);
  const first = seed.items.find((i) => i.responseType === 'info')!;
  await expect(page.getByText(first.source.en.text, { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'End session', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(page.getByText('Patient language', { exact: true }).last()).toBeVisible();
});
test('camera denial has manual offline transfer preview, import, correction and deletion', async ({
  page,
}) => {
  await setup(page);
  await page.getByRole('button', { name: 'Scan QR', exact: true }).click();
  await page.getByRole('button', { name: 'Scan QR', exact: true }).click();
  const cameraPolicy = await page.context().newCDPSession(page);
  const { targetInfo } = await cameraPolicy.send('Target.getTargetInfo');
  await cameraPolicy.send('Browser.setPermission', {
    browserContextId: targetInfo.browserContextId,
    origin: 'http://localhost:8081',
    permission: { name: 'camera' },
    setting: 'denied',
  });
  await expect
    .poll(() =>
      page.evaluate(
        async () => (await navigator.permissions.query({ name: 'camera' as PermissionName })).state,
      ),
    )
    .toBe('denied');
  await page.getByRole('button', { name: 'Allow camera', exact: true }).click();
  await expect(
    page.getByText(
      'Camera unavailable. Allow camera access in device settings or enter a QR chunk.',
      { exact: true },
    ),
  ).toBeVisible();
  const session = {
    id: 'synthetic-import',
    events: [
      createEvent(
        'synthetic-import-answer',
        'thorax_001',
        'da',
        { kind: 'choice', code: 'no' },
        '2026-01-01T10:00:00.000Z',
      ),
    ],
  };
  for (const chunk of encodeTransfer(session)) {
    await page.getByRole('textbox', { name: 'Enter QR chunk', exact: true }).fill(chunk);
    await page.getByRole('button', { name: 'Read chunk', exact: true }).click();
  }
  await expect(page.getByText('Do you have chest pain?', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Replace session', exact: true }).click();
  await page.getByRole('button', { name: 'Chronological', exact: true }).click();
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Ja', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Ja', exact: true }).click();
  await expect(page.getByText('Yes', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(page.getByText('No answers', { exact: true })).toBeVisible();
});
