import { test, expect } from '@playwright/test';

test.describe('Document Management App', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the app to load and documents to be fetched
    await page.waitForLoadState('networkidle');
    
    // Wait for documents to be loaded
    await expect(page.locator('[data-testid="document-item"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display the document management system', async ({ page }) => {
    // Check if the page has loaded successfully
    await expect(page).toHaveTitle(/React App/);
    
    // Check main heading
    await expect(page.locator('[data-testid="page-title-header"]')).toContainText('Document Management System');
    
    // Check search input is present
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
    
    // Check add button is present
    await expect(page.locator('[data-testid="add-document-btn"]')).toBeVisible();
  });

  test('should load and display documents from JSON file', async ({ page }) => {
    // Check that documents are loaded and displayed
    const documentItems = page.locator('[data-testid="document-item"]');
    
    // Should have 10 initial documents
    await expect(documentItems).toHaveCount(10);
    
    // Check that first document displays expected content
    const firstDocument = documentItems.first();
    await expect(firstDocument).toContainText('Premier Financial Corp. Surveillance Report');
    await expect(firstDocument).toContainText('Amy Smith');
    await expect(firstDocument).toContainText('LIVE');
    
    // Verify document counter
    await expect(page.locator('[data-testid="documents-header"]')).toContainText('Documents (10)');
  });

  test('should allow searching documents by name', async ({ page }) => {
    // Test search functionality
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Search for "Credit" documents
    await searchInput.fill('Credit');
    
    // Should filter to documents containing "Credit"
    const documentItems = page.locator('[data-testid="document-item"]');
    await expect(documentItems).toHaveCount(7); // There are 7 credit-related documents
    
    // Verify filtered results contain search term
    await expect(documentItems.first()).toContainText('Credit');
    
    // Test search by author
    await searchInput.clear();
    await searchInput.fill('John Doe');
    
    // Should show only John Doe's documents
    await expect(documentItems).toHaveCount(4);
    
    // Clear search should show all documents again
    await searchInput.clear();
    await expect(documentItems).toHaveCount(10);
    
    // Test case-insensitive search
    await searchInput.fill('credit card');
    await expect(documentItems).toHaveCount(5);
  });

  test('should allow adding a new document', async ({ page }) => {
    // Click add document button
    await page.click('[data-testid="add-document-btn"]');
    
    // Verify modal opens
    await expect(page.locator('[data-testid="modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="modal-title"]')).toContainText('Add New Document');
    
    // Fill in the form
    await page.fill('[data-testid="title-input"]', 'Test Document Title');
    await page.fill('[data-testid="content-input"]', 'This is test content for the new document.');
    await page.fill('[data-testid="author-input"]', 'Test Author');
    await page.selectOption('[data-testid="status-select"]', 'Live');
    
    // Submit the form
    await page.click('[data-testid="save-btn"]');
    
    // Verify modal closes
    await expect(page.locator('[data-testid="modal"]')).not.toBeVisible();
    
    // Verify new document appears in the list
    await expect(page.locator('text=Test Document Title')).toBeVisible();
    await expect(page.locator('text=Test Author')).toBeVisible();
    
    // Verify document count increased
    await expect(page.locator('[data-testid="documents-header"]')).toContainText('Documents (11)');
  });

  test('should allow editing an existing document', async ({ page }) => {
    // Click edit button on the first document
    await page.click('[data-testid="edit-btn"]', { force: true });
    
    // Verify edit modal opens
    await expect(page.locator('[data-testid="modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="modal-title"]')).toContainText('Edit Document');
    
    // Verify form is pre-populated with existing data
    const titleInput = page.locator('[data-testid="title-input"]');
    await expect(titleInput).toHaveValue('Premier Financial Corp. Surveillance Report');
    
    // Update the title
    await titleInput.clear();
    await titleInput.fill('Updated Premier Financial Report');
    
    // Update other fields
    await page.fill('[data-testid="content-input"]', 'Updated surveillance report content.');
    await page.selectOption('[data-testid="status-select"]', 'Preview');
    
    // Save changes
    await page.click('[data-testid="save-btn"]');
    
    // Verify modal closes
    await expect(page.locator('[data-testid="modal"]')).not.toBeVisible();
    
    // Verify changes are reflected in the document list
    await expect(page.locator('text=Updated Premier Financial Report')).toBeVisible();
    await expect(page.locator('text=Updated surveillance report content.')).toBeVisible();
    
    // Verify status was updated
    const firstDocument = page.locator('[data-testid="document-item"]').first();
    await expect(firstDocument.locator('.status.preview')).toBeVisible();
  });

  test('should allow deleting a document', async ({ page }) => {
    // Get initial count
    const initialCount = await page.locator('[data-testid="document-item"]').count();
    
    // Get the title of the first document to verify it's deleted
    const firstDocumentTitle = await page.locator('[data-testid="document-item"]').first().locator('h3').textContent();
    
    // Click delete button on the first document
    await page.click('[data-testid="delete-btn"]', { force: true });
    
    // Verify confirmation dialog appears
    await expect(page.locator('[data-testid="modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="modal-title"]')).toContainText('Confirm Delete');
    await expect(page.locator('[data-testid="modal"] p')).toContainText(firstDocumentTitle || '');
    
    // Confirm deletion
    await page.click('[data-testid="confirm-delete"]');
    
    // Verify confirmation dialog closes
    await expect(page.locator('[data-testid="modal"]')).not.toBeVisible();
    
    // Verify document count decreased
    await expect(page.locator('[data-testid="document-item"]')).toHaveCount(initialCount - 1);
    
    // Verify the specific document is no longer visible
    await expect(page.locator(`text=${firstDocumentTitle}`)).not.toBeVisible();
    
    // Verify document counter updated
    await expect(page.locator('[data-testid="documents-header"]')).toContainText(`Documents (${initialCount - 1})`);
  });

  test('should prevent duplicate document entries', async ({ page }) => {
    // Click add document button
    await page.click('[data-testid="add-document-btn"]');
    
    // Try to add a document with an existing title
    await page.fill('[data-testid="title-input"]', 'Premier Financial Corp. Surveillance Report');
    await page.fill('[data-testid="content-input"]', 'Duplicate content test');
    await page.fill('[data-testid="author-input"]', 'Test Author');
    
    // Submit the form
    await page.click('[data-testid="save-btn"]');
    
    // Verify error message appears
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('already exists');
    
    // Verify modal stays open (document not added)
    await expect(page.locator('[data-testid="modal"]')).toBeVisible();
    
    // Verify document count hasn't changed
    const documentCount = await page.locator('[data-testid="document-item"]').count();
    await expect(page.locator('[data-testid="documents-header"]')).toContainText(`Documents (${documentCount})`);
    
    // Cancel the form
    await page.click('[data-testid="cancel-btn"]');
    await expect(page.locator('[data-testid="modal"]')).not.toBeVisible();
  });

  test('should handle form validation', async ({ page }) => {
    // Click add document button
    await page.click('[data-testid="add-document-btn"]');
    
    // Try to submit empty form
    await page.click('[data-testid="save-btn"]');
    
    // Form should not submit (HTML5 validation or custom validation)
    await expect(page.locator('[data-testid="modal"]')).toBeVisible();
    
    // Fill only title
    await page.fill('[data-testid="title-input"]', 'Test Title');
    await page.click('[data-testid="save-btn"]');
    
    // Should still not submit without required fields
    await expect(page.locator('[data-testid="modal"]')).toBeVisible();
    
    // Cancel the form
    await page.click('[data-testid="cancel-btn"]');
  });

  test('should maintain search results during document operations', async ({ page }) => {
    // Search for credit documents
    await page.fill('[data-testid="search-input"]', 'Credit');
    
    // Verify filtered results
    const documentItems = page.locator('[data-testid="document-item"]');
    const filteredCount = await documentItems.count();
    
    // Add a new credit document
    await page.click('[data-testid="add-document-btn"]');
    await page.fill('[data-testid="title-input"]', 'New Credit Analysis Document');
    await page.fill('[data-testid="content-input"]', 'Analysis of credit market trends');
    await page.fill('[data-testid="author-input"]', 'Test Analyst');
    await page.click('[data-testid="save-btn"]');
    
    // Search should still be active and include new document
    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('Credit');
    await expect(documentItems).toHaveCount(filteredCount + 1);
    await expect(page.locator('text=New Credit Analysis Document')).toBeVisible();
  });

  test('should handle modal interactions correctly', async ({ page }) => {
    // Test add modal cancel
    await page.click('[data-testid="add-document-btn"]');
    await expect(page.locator('[data-testid="modal"]')).toBeVisible();
    await page.click('[data-testid="cancel-btn"]');
    await expect(page.locator('[data-testid="modal"]')).not.toBeVisible();
    
    // Test edit modal cancel
    await page.click('[data-testid="edit-btn"]', { force: true });
    await expect(page.locator('[data-testid="modal"]')).toBeVisible();
    await page.click('[data-testid="cancel-btn"]');
    await expect(page.locator('[data-testid="modal"]')).not.toBeVisible();
    
    // Test delete modal cancel
    await page.click('[data-testid="delete-btn"]', { force: true });
    await expect(page.locator('[data-testid="modal"]')).toBeVisible();
    await page.click('[data-testid="cancel-btn"]');
    await expect(page.locator('[data-testid="modal"]')).not.toBeVisible();
  });
});