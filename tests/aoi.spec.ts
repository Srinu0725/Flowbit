import { test, expect } from '@playwright/test';

test.describe('AOI Page', () => {
  test('should load and display the initial layout correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check that the main page loads
    await expect(page.getByTestId('aoi-page')).toBeVisible();
    
    // Check that the sidebar title is present
    await expect(page.getByText('Define Area of Interest')).toBeVisible();
    
    // Check that the search input is present
    await expect(page.getByPlaceholder('Search location...')).toBeVisible();
    
    // Check that the confirm button is initially disabled
    const confirmButton = page.getByTestId('confirm-aoi-button');
    await expect(confirmButton).toBeVisible();
    await expect(confirmButton).toBeDisabled();
    
    // Check that drawing tools are present
    await expect(page.getByTestId('tool-draw')).toBeVisible();
    await expect(page.getByTestId('tool-edit')).toBeVisible();
    await expect(page.getByTestId('tool-select')).toBeVisible();
    await expect(page.getByTestId('tool-erase')).toBeVisible();
  });

  test('should toggle between Base Image and Map View', async ({ page }) => {
    await page.goto('/');
    
    const baseImageToggle = page.getByTestId('base-image-toggle');
    const mapViewToggle = page.getByTestId('map-view-toggle');
    
    // Base Image should be active by default
    await expect(baseImageToggle).toHaveClass(/bg-blue-600/);
    await expect(mapViewToggle).not.toHaveClass(/bg-blue-600/);
    
    // Click Map View toggle
    await mapViewToggle.click();
    await expect(mapViewToggle).toHaveClass(/bg-blue-600/);
    await expect(baseImageToggle).not.toHaveClass(/bg-blue-600/);
    
    // Click Base Image toggle
    await baseImageToggle.click();
    await expect(baseImageToggle).toHaveClass(/bg-blue-600/);
    await expect(mapViewToggle).not.toHaveClass(/bg-blue-600/);
  });

  test('should enable confirm button after drawing an AOI', async ({ page }) => {
    await page.goto('/');
    
    const confirmButton = page.getByTestId('confirm-aoi-button');
    const drawTool = page.getByTestId('tool-draw');
    
    // Confirm button should be disabled initially
    await expect(confirmButton).toBeDisabled();
    
    // Click draw tool to activate it
    await drawTool.click();
    await expect(drawTool).toHaveClass(/bg-blue-600/);
    
    // Simulate drawing a polygon by clicking on the map
    const mapContainer = page.locator('.ol-viewport').first();
    await mapContainer.click({ position: { x: 100, y: 100 } });
    await mapContainer.click({ position: { x: 200, y: 100 } });
    await mapContainer.click({ position: { x: 200, y: 200 } });
    await mapContainer.click({ position: { x: 100, y: 200 } });
    // Double-click to finish the polygon
    await mapContainer.dblclick({ position: { x: 100, y: 100 } });
    
    // Wait a bit for the AOI to be processed
    await page.waitForTimeout(500);
    
    // Confirm button should now be enabled
    await expect(confirmButton).toBeEnabled();
  });
});