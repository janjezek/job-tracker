function extractJobInfo() {
    // Job title selector
    const jobTitle = document.querySelector('h1.t-24, h1.job-details-jobs-unified-top-card__job-title')?.innerText || '';
    
    // Company name selectors
    const companySelectors = [
        '.jobs-unified-top-card__company-name',
        '.job-details-jobs-unified-top-card__primary-description a',
        '.job-details-jobs-unified-top-card__company-name'
    ];
    let company = '';
    for (const selector of companySelectors) {
        const element = document.querySelector(selector);
        if (element) {
            company = element.innerText;
            break;
        }
    }

    // Location extraction with the correct LinkedIn class
    let location = '';
    
    // Try to get location from the specific LinkedIn class
    const locationElements = document.querySelectorAll('.tvm__text.tvm__text--low-emphasis');
    for (const element of locationElements) {
        const text = element.innerText.trim();
        // Check if the text looks like a location (contains commas and no unwanted content)
        if (text && text.includes(',') && !text.includes('ago') && !text.includes('applicants')) {
            location = text;
            break;
        }
    }

    // If still no location, try the metadata
    if (!location) {
        const metaLocation = document.querySelector('meta[name="job-location"]');
        if (metaLocation) {
            location = metaLocation.getAttribute('content');
        }
    }

    // Clean up the extracted data
    company = company.replace('Company Name', '').trim();
    location = location.replace('Location', '').trim();
    
    // Remove any quotes that might be in the location string
    location = location.replace(/"/g, '').trim();

    const url = window.location.href;

    // Log everything for debugging
    console.log('Extracted job info:', { 
        position: jobTitle, 
        company: company, 
        location: location, 
        url: url 
    });

    return {
        position: jobTitle.trim(),
        company: company,
        location: location || 'No location specified',
        url: url
    };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getJobInfo') {
        sendResponse(extractJobInfo());
    }
});
