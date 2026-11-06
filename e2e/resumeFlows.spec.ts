import { test, expect } from '@playwright/test';

test.describe('End-to-End User Workflows', () => {
  test('1. Resume Builder: Updates live preview in real-time and switches ATS templates', async ({ page }) => {
    await page.goto('/');

    // Check title & branding
    await expect(page.locator('text=ATS Resume Studio')).toBeVisible();

    // Verify Personal Info input exists
    const nameInput = page.locator('input[name="fullName"]');
    await expect(nameInput).toBeVisible();

    // Type a new candidate name
    await nameInput.fill('Sarah Connor');

    // Verify Live Preview canvas reacts immediately
    const previewCanvas = page.locator('text=SARAH CONNOR');
    await expect(previewCanvas).toBeVisible();

    // Switch to Modern ATS Template
    const modernBtn = page.locator('button:has-text("Modern ATS")');
    await modernBtn.click();
    await expect(page.locator('text=Sarah Connor')).toBeVisible();

    // Switch to Minimal ATS Template
    const minimalBtn = page.locator('button:has-text("Minimal ATS")');
    await minimalBtn.click();
    await expect(page.locator('text=Sarah Connor')).toBeVisible();

    // Navigate to Work Experience wizard step
    const expTab = page.locator('button:has-text("Experience")').first();
    await expTab.click();

    // Verify per-bullet helper elements are present
    await expect(page.locator('text=Key Accomplishments')).toBeVisible();
  });

  test('2. ATS Analyzer: Evaluates active resume against job description and renders explainable breakdown', async ({ page }) => {
    await page.goto('/');

    // Switch to ATS Analyzer tab
    const analyzerNavBtn = page.locator('button:has-text("ATS Analyzer")');
    await analyzerNavBtn.click();

    // Verify Job Description textarea is loaded
    const jdTextarea = page.locator('textarea');
    await expect(jdTextarea).toBeVisible();

    // Click Compute ATS Match Score
    const computeBtn = page.locator('button:has-text("Compute ATS Match Score")');
    await computeBtn.click();

    // Verify overall score badge appears
    await expect(page.locator('text=/ 100 ATS')).toBeVisible({ timeout: 10000 });

    // Verify dimension breakdown cards appear
    await expect(page.locator('text=Dimension Breakdown')).toBeVisible();
    await expect(page.locator('text=Keyword Match')).toBeVisible();
    await expect(page.locator('text=Section Completeness')).toBeVisible();
    await expect(page.locator('text=Formatting & Parsability')).toBeVisible();

    // Verify Matched & Missing Keywords sections appear
    await expect(page.locator('text=Matched Keywords')).toBeVisible();
    await expect(page.locator('text=Missing Target Keywords')).toBeVisible();

    // Verify actionable suggestions appear
    await expect(page.locator('text=Actionable Improvements')).toBeVisible();
  });
});

