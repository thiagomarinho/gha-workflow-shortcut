// Create context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openWorkflowLink",
    title: "Open workflow link",
    contexts: ["selection"], // Only show the context menu when text is selected
    documentUrlPatterns: ["*://github.com/*"] // Only show on GitHub pages
  });
});

// Handle the context menu click event
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openWorkflowLink") {
    const textPattern = /^([a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+\/.*\.(ya?ml))@([a-zA-Z0-9-_\.\/]+)$/;
    const match = info.selectionText.match(textPattern);

    if (match) {
      console.log('URL matched expected github workflow format');
      const githubWorkflowUrl = parseGithubWorkflowReference(info.selectionText);

      // Open the constructed workflow URL in a new tab
      console.log('Opening new tab');
      chrome.tabs.create({ url: githubWorkflowUrl });
    } else {
      console.log("URL didn't match expected github workflow format");
      // If the text doesn't match, show an alert (or handle the error)
      // chrome.tabs.executeScript(tab.id, {
      //   code: 'alert("Selected text does not match the required pattern.")'
      // });
    }
  }
});

function parseGithubWorkflowReference(text) {
  const splitted = text.split('/');
  const repository = `${splitted[0]}/${splitted[1]}`;
  
  let pathToWorkflow = '';
  const match = text.match(/^[^/]+\/[^/]+\/([^@]+)@/);
  if (match) {
    pathToWorkflow = match[1];
  } else {
    alert('Invalid workflow reference!');
  }

  const githubRef = text.split('@')[1];
  const url = `https://github.com/${repository}/blob/${githubRef}/${pathToWorkflow}`;

  console.log(`Github URL: ${url}`);

  return url;
}

chrome.omnibox.onInputEntered.addListener((text) => {
  // Expected format: owner-name/repo-name/path/to/file.yml@github_ref
  // sample: thiagomarinho/gha-workflow-shortcut/.github/workflows/workflow.yml@main

  if (text) {
    const githubWorkflowUrl = parseGithubWorkflowReference(text);

    // Opening in current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        console.log('Updating current tab');
        chrome.tabs.update(tabs[0].id, { url: githubWorkflowUrl });
      }
    });
  }
});
