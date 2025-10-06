import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXTENSION_PATH = path.join(__dirname, '../../dist/chromium');

test.describe('Extension Options Page', () => {
  test('should load options page', async ({ page }) => {
    await page.goto(`file://${path.join(EXTENSION_PATH, 'options.html')}`);
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#form')).toBeVisible();
  });

  test('should have all form fields', async ({ page }) => {
    await page.goto(`file://${path.join(EXTENSION_PATH, 'options.html')}`);
    
    // Map provider select
    await expect(page.locator('select[name="mapProvider"]')).toBeVisible();
    
    // Position select
    await expect(page.locator('select[name="position"]')).toBeVisible();
    
    // Theme select
    await expect(page.locator('select[name="theme"]')).toBeVisible();
    
    // Auto copy checkbox
    await expect(page.locator('input[name="autoCopy"]')).toBeVisible();
    
    // Locale override select
    await expect(page.locator('select[name="localeOverride"]')).toBeVisible();
    
    // Save button
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should have correct default values', async ({ page }) => {
    await page.goto(`file://${path.join(EXTENSION_PATH, 'options.html')}`);
    
    // Wait for script to load
    await page.waitForTimeout(500);
    
    const mapProvider = await page.locator('select[name="mapProvider"]').inputValue();
    const autoCopy = await page.locator('input[name="autoCopy"]').isChecked();
    const position = await page.locator('select[name="position"]').inputValue();
    const theme = await page.locator('select[name="theme"]').inputValue();
    const locale = await page.locator('select[name="localeOverride"]').inputValue();
    
    expect(mapProvider).toBe('google');
    expect(autoCopy).toBe(false);
    expect(position).toBe('bottom-right');
    expect(theme).toBe('dark');
    expect(locale).toBe('auto');
  });

  test('should have all map provider options', async ({ page }) => {
    await page.goto(`file://${path.join(EXTENSION_PATH, 'options.html')}`);
    
    const options = await page.locator('select[name="mapProvider"] option').allTextContents();
    
    expect(options).toContain('Google Maps');
    expect(options).toContain('OpenStreetMap');
    expect(options).toContain('Apple Maps');
  });

  test('should have all position options', async ({ page }) => {
    await page.goto(`file://${path.join(EXTENSION_PATH, 'options.html')}`);
    
    const optionValues = await page.locator('select[name="position"] option').allTextContents();
    
    expect(optionValues.length).toBe(4);
  });

  test('should have all theme options', async ({ page }) => {
    await page.goto(`file://${path.join(EXTENSION_PATH, 'options.html')}`);
    
    const options = await page.locator('select[name="theme"] option').allTextContents();
    
    expect(options.length).toBe(2);
  });

  test('should have all locale options', async ({ page }) => {
    await page.goto(`file://${path.join(EXTENSION_PATH, 'options.html')}`);
    
    const options = await page.locator('select[name="localeOverride"] option').count();
    
    expect(options).toBeGreaterThanOrEqual(5); // auto, de, en, es, it
  });

  test('should have version element', async ({ page }) => {
    await page.goto(`file://${path.join(EXTENSION_PATH, 'options.html')}`);
    
    // Version element should exist in DOM
    const versionEl = page.locator('#version');
    await expect(versionEl).toBeAttached();
    
    // When loaded as file://, chrome.runtime API is not available
    // so version will be empty. In real extension it shows actual version.
  });

  test('should have GitHub link', async ({ page }) => {
    await page.goto(`file://${path.join(EXTENSION_PATH, 'options.html')}`);
    
    const link = page.locator('a[href*="github.com"]');
    await expect(link).toBeVisible();
    
    const href = await link.getAttribute('href');
    expect(href).toContain('kidzki/immo24-address-decoder');
  });
});
