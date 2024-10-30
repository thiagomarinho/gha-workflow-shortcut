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

  // git::git@github.com:Github-Org/github-repo?ref=git-ref
  // git::git@github.com:Github-Org/github-repo//path?ref=git-ref
  // git::git@github.com:Github-Org/github-repo//modules/path?ref=git-ref
  // git::https://github.com/hashicorp/terraform-random-tfe-utility//modules/tfe_init?ref=main
  const terraformModulePattern = /^git::(?:git@|https:\/\/)github\.com(?::|\/)([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)(?:\/\/([A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*)?)?\?ref=([A-Za-z0-9_.-]+)$/;
  const isTerraformModule = text.match(terraformModulePattern);

  if (isTerraformModule) {
    console.log('URL matched expected terraform module format');
    console.log('call parseTerraformModuleReference');
    const terraformModuleUrl = parseTerraformModuleReference(text);
    console.log('called parseTerraformModuleReference');

    if (terraformModuleUrl) {
      return terraformModuleUrl;
    } else {
      console.log(`Failed to build URL from terraform module reference ${text}`);
    }
  } else {
    console.log("URL didn't match expected terraform module format");
  }

  return '';
}

function parseTerraformModuleReference(text) {
  const match = text.match(/^git::(?:git@|https:\/\/)github\.com(?::|\/)([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)(?:\/\/([A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*)?)?\?ref=([A-Za-z0-9_.-]+)$/);

  const repository = `${match[1]}/${match[2]}`;

  const baseUrl = `https://github.com/${repository}/blob/${match[4]}`;

  let url;
  if (match[3]) {
    url = `${baseUrl}/${match[3]}`
  } else {
    url = baseUrl;
  }

  console.log(`URL: ${url}`);

  return url;
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
