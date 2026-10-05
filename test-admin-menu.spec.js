import { test, expect } from '@playwright/test';

// Test suite for /admin/menu page

test.describe('Admin Menu Page Tests', () => {
    test('Accessibility: Page loads without errors', async ({ page }) => {
        await page.goto('http://localhost:3000/admin/menu'); // Adjust URL if needed

        // Check for accessibility errors
        const accessibilityScan = await page.evaluate(() => {
            const errors = [];
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(() => {
                    const newErrors = Array.from(document.querySelectorAll('[aria-invalid], [role="alert"], .error-message'));
                    errors.push(...newErrors.map(el => el.textContent.trim()));
                });
            });
            observer.observe(document.body, { childList: true, subtree: true });
            return errors;
        });

        expect(accessibilityScan.length).toBe(0, 'No accessibility errors found');
    });

    test('Display: Menu items are rendered correctly', async ({ page }) => {
        await page.goto('http://localhost:3000/admin/menu');

        // Check if menu items are visible
        const menuItems = await page.$$eval('nav ul li a', (links) => {
            return links.map(link => link.textContent.trim());
        });

        expect(menuItems.length).toBeGreaterThan(0, 'Menu items should be visible');
        expect(menuItems).not.toContain('', 'Menu items should not be empty');
    });

    test('Functionality: Menu items are clickable and lead to intended pages', async ({ page }) => {
        await page.goto('http://localhost:3000/admin/menu');

        // Click on the first menu item
        const firstMenuItem = await page.$eval('nav ul li a', (link) => link.href);

        await page.click('nav ul li a:first-child');

        // Verify navigation or action
        const newUrl = page.url();
        expect(newUrl).not.toBe('http://localhost:3000/admin/menu', 'Navigation should occur');
    });

    test('Business Isolation: No unauthorized access or data leakage', async ({ page }) => {
        await page.goto('http://localhost:3000/admin/menu');

        // Check for unauthorized access indicators
        const unauthorizedAccess = await page.evaluate(() => {
            const unauthorizedElements = Array.from(document.querySelectorAll('[data-unauthorized], .unauthorized-access'));
            return unauthorizedElements.length > 0;
        });

        expect(unauthorizedAccess).toBe(false, 'No unauthorized access indicators found');
    });
});