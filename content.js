function extractJobInfo() {
  // Default empty values
  let jobInfo = {
    position: "",
    company: "",
    location: "",
    url: window.location.href,
  };

  // Only try to extract LinkedIn data if we're on LinkedIn
  if (window.location.href.includes("linkedin.com/jobs")) {
    // Job title selector
    jobInfo.position =
      document.querySelector(
        "h1.t-24, h1.job-details-jobs-unified-top-card__job-title"
      )?.innerText || "";

    // Company name selectors
    const companySelectors = [
      ".jobs-unified-top-card__company-name",
      ".job-details-jobs-unified-top-card__primary-description a",
      ".job-details-jobs-unified-top-card__company-name",
    ];
    for (const selector of companySelectors) {
      const element = document.querySelector(selector);
      if (element) {
        jobInfo.company = element.innerText;
        break;
      }
    }

    // Location extraction
    const locationElements = document.querySelectorAll(
      ".tvm__text.tvm__text--low-emphasis"
    );
    for (const element of locationElements) {
      const text = element.innerText.trim();
      if (
        text &&
        text.includes(",") &&
        !text.includes("ago") &&
        !text.includes("applicants")
      ) {
        jobInfo.location = text;
        break;
      }
    }

    // Clean up the extracted data
    jobInfo.company = jobInfo.company.replace("Company Name", "").trim();
    jobInfo.location = jobInfo.location
      .replace("Location", "")
      .replace(/"/g, "")
      .trim();
  }

  return jobInfo;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getJobInfo") {
    sendResponse(extractJobInfo());
  }
});
