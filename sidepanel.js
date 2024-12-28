// Wait for the iframe to load
document.getElementById("airtableForm").addEventListener("load", async () => {
  // Get the current active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Only proceed if we're on a LinkedIn job page
  if (tab.url.includes("linkedin.com/jobs")) {
    // Get job information from the content script
    chrome.tabs.sendMessage(tab.id, { action: "getJobInfo" }, (jobInfo) => {
      if (jobInfo) {
        // Get the iframe document
        const iframe = document.getElementById("airtableForm");

        // Wait for Airtable form to load and attempt to fill fields
        setTimeout(() => {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

          // Find and fill position field
          const positionInput = iframeDoc.querySelector('input[placeholder*="Position"]');
          if (positionInput) positionInput.value = jobInfo.position;

          // Find and fill company field
          const companyInput = iframeDoc.querySelector('input[placeholder*="Company"]');
          if (companyInput) companyInput.value = jobInfo.company;

          // Find and fill URL field
          const urlInput = iframeDoc.querySelector('input[placeholder*="Job description"]');
          if (urlInput) urlInput.value = jobInfo.url;

          // Trigger input events to ensure Airtable recognizes the changes
          [positionInput, companyInput, urlInput].forEach((input) => {
            if (input) {
              input.dispatchEvent(new Event("input", { bubbles: true }));
            }
          });
        }, 2000); // Give Airtable form time to load
      }
    });
  }
});
