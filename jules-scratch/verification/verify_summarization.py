from playwright.sync_api import sync_playwright, TimeoutError

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        page.goto("http://localhost:5173", wait_until="networkidle")

        # Wait for the button to be visible with a longer timeout
        summarize_button = page.locator("button:has-text('Summarize')")
        summarize_button.wait_for(state="visible", timeout=10000)

        summarize_button.click()

        # Wait for the summary content to appear
        summary_content = page.locator(".summary-content")
        summary_content.wait_for(state="visible", timeout=10000)

        page.screenshot(path="jules-scratch/verification/verification.png")

    except TimeoutError as e:
        print(f"TimeoutError: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")
        print("An error screenshot has been saved to 'jules-scratch/verification/error.png'")
        print("Page content on error:")
        print(page.content())
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)