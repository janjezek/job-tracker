const AIRTABLE_API_KEY =
  "pat5HHu7V1Sw9JswZ.4cdcbd584118323032bde9db991bb09fc00cab6f858ef28d9fde114642dd2f28";
const AIRTABLE_BASE_ID = "app4AkHyJbvXv3tgH";
const AIRTABLE_TABLE_NAME = "Jobs";

async function sendToAirtable(jobData) {
  try {
    console.log("Sending data to Airtable:", jobData);
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                Position: jobData.position,
                Company: jobData.company,
                Location: jobData.location,
                Status: "Applied",
                "Job description": jobData.url,
              },
            },
          ],
        }),
      }
    );

    const responseData = await response.json();
    console.log("Airtable response:", responseData);

    if (!response.ok) {
      throw new Error(
        `Airtable error: ${responseData.error?.message || "Unknown error"}`
      );
    }

    return responseData;
  } catch (error) {
    console.error("Detailed error:", error);
    throw new Error(`Failed to save to Airtable: ${error.message}`);
  }
}

function showMessage(message, isError = false) {
  const messageDiv = document.getElementById("message");
  messageDiv.textContent = message;
  messageDiv.className = `message ${isError ? "error" : "success"}`;
}

document.addEventListener("DOMContentLoaded", async function () {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const jobForm = document.getElementById("jobForm");
  const trackButton = document.getElementById("trackButton");

  // Add keyboard shortcut listener
  document.addEventListener("keydown", async function (e) {
    // Check for Cmd+Enter (Mac) or Ctrl+Enter (Windows)
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (!trackButton.disabled) {
        trackButton.click();
      }
    }
  });

  // Set focus to the position field
  document.getElementById("position").focus();

  // Try to get job information from the content script
  chrome.tabs.sendMessage(tab.id, { action: "getJobInfo" }, async (jobInfo) => {
    // If we got any job info, use it, otherwise initialize with empty values
    const info = jobInfo || {
      position: "",
      company: "",
      location: "",
      url: tab.url, // Always use current tab's URL
    };

    document.getElementById("position").value = info.position;
    document.getElementById("company").value = info.company;
    document.getElementById("location").value = info.location;
    document.getElementById("url").value = info.url;

    jobForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      trackButton.disabled = true;

      const updatedJobInfo = {
        position: document.getElementById("position").value,
        company: document.getElementById("company").value,
        location: document.getElementById("location").value,
        url: document.getElementById("url").value,
      };

      try {
        const result = await sendToAirtable(updatedJobInfo);
        console.log("Success:", result);
        showMessage("Job successfully tracked!");
      } catch (error) {
        console.error("Submission error:", error);
        showMessage(`Failed to track job: ${error.message}`, true);
      } finally {
        trackButton.disabled = false;
      }
    });
  });
});
