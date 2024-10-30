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
    const url = parseReference(info.selectionText);

    if (url) {
      console.log('Opening new tab');
      chrome.tabs.create({ url: url });
    } else {
      console.log(`Failed to build URL from selectedText ${info.selectionText}`);
    }
  }
});

function parseReference(text) {
  // Expected format: owner-name/repo-name/path/to/file.yml@github_ref
  // sample: thiagomarinho/gha-workflow-shortcut/.github/workflows/workflow.yml@main
  const workflowPattern = /^([a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+\/.*\.(ya?ml))@([a-zA-Z0-9-_\.\/]+)$/;
  const isGithubWorkflow = text.match(workflowPattern);

  if (isGithubWorkflow) {
    console.log('URL matched expected github workflow format');
    const githubWorkflowUrl = parseGithubWorkflowReference(text);

    if (githubWorkflowUrl) {
      return githubWorkflowUrl;
    } else {
      console.log(`Failed to build URL from workflow reference ${text}`);
    }
  } else {
    console.log("URL didn't match expected github workflow format");
  }

  // Expected formats: owner-name/repo-name@reference
  // sample: thiagomarinho/gha-workflow-shortcut@main
  const actionPattern = /^([a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+)@([a-zA-Z0-9-_\.\/]+)$/;
  const isGithubAction = text.match(actionPattern);

  if (isGithubAction) {
    console.log('URL matched expected github action format');
    const githubActionUrl = parseGithubActionReference(text);

    if (githubActionUrl) {
      return githubActionUrl;
    } else {
      console.log(`Failed to build URL from action reference ${text}`);
    }
  } else {
    console.log("URL didn't match expected github action format");
  }



  return '';
}

function parseGithubActionReference(text) {
  const match = text.match(/^([a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+)@/);

  const githubRef = text.split('@')[1];
  const url = `https://github.com/${match[1]}/blob/${githubRef}`;

  console.log(`URL: ${url}`);

  return url;
}

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

  console.log(`URL: ${url}`);

  return url;
}

chrome.omnibox.onInputEntered.addListener((text) => {
  if (text) {
    const url = parseReference(text);

    // Opening in current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        console.log('Updating current tab');
        chrome.tabs.update(tabs[0].id, { url: url });
      }
    });
  }
});
