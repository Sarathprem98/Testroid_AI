import type { Page, TestInfo } from '@playwright/test';

export const captureFailureScreenshot = async (
  page: Page,
  testInfo: TestInfo,
  name = 'failure-screenshot'
): Promise<string> => {
  const fileName = `${name}-${Date.now()}.png`;
  const screenshotPath = testInfo.outputPath(fileName);

  await page.screenshot({ path: screenshotPath, fullPage: true });
  await testInfo.attach(name, { path: screenshotPath, contentType: 'image/png' });

  return screenshotPath;
};