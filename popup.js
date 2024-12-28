const AIRTABLE_API_KEY = "pat5HHu7V1Sw9JswZ.4cdcbd584118323032bde9db991bb09fc00cab6f858ef28d9fde114642dd2f28";
const AIRTABLE_BASE_ID = "app4AkHyJbvXv3tgH";
const AIRTABLE_TABLE_NAME = "Jobs";

async function sendToAirtable(jobData) {
  try {
    console.log("Sending data to Airtable:", jobData);
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`, {
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
    });

    const responseData = await response.json();
    console.log("Airtable response:", responseData);

    if (!response.ok) {
      throw new Error(`Airtable error: ${responseData.error?.message || "Unknown error"}`);
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
  const trackButton = document.getElementById("trackButton");

  // Add keyboard shortcut listener
  document.addEventListener("keydown", async function(e) {
    // Check for Cmd+Enter (Mac) or Ctrl+Enter (Windows)
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (!trackButton.disabled) {
        trackButton.click();
      }
    }
  });

  // Only proceed if we're on a LinkedIn job page
  if (tab.url.includes("linkedin.com/jobs")) {
    // Get job information from the content script
    chrome.tabs.sendMessage(tab.id, { action: "getJobInfo" }, async (jobInfo) => {
      if (jobInfo) {
        document.getElementById("position").textContent = jobInfo.position;
        document.getElementById("company").textContent = jobInfo.company;
        document.getElementById("location").textContent = jobInfo.location;
        document.getElementById("url").textContent = jobInfo.url;

        trackButton.addEventListener("click", async function () {
          trackButton.disabled = true;
          try {
            const result = await sendToAirtable(jobInfo);
            console.log("Success:", result);
            showMessage("Job successfully tracked!");
          } catch (error) {
            console.error("Submission error:", error);
            showMessage(`Failed to track job: ${error.message}`, true);
          } finally {
            trackButton.disabled = false;
          }
        });
      }
    });
  } else {
    document.getElementById("position").textContent = "Please open a LinkedIn job posting";
    document.getElementById("company").textContent = "N/A";
    document.getElementById("location").textContent = "N/A";
    document.getElementById("url").textContent = "N/A";
    trackButton.disabled = true;
  }
});
