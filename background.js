chrome.omnibox.onInputEntered.addListener((githubWorkflowReference) => {
  // Expected format: owner-name/repo-name/path/to/file.yml@github_ref
  // sample: thiagomarinho/gha-workflow-shortcut/.github/workflows/workflow.yml@main

  if (githubWorkflowReference) {
    const splitted = githubWorkflowReference.split('/');
    const repository = `${splitted[0]}/${splitted[1]}`;
    
    let pathToWorkflow = '';
    const match = githubWorkflowReference.match(/^[^/]+\/[^/]+\/([^@]+)@/);
    if (match) {
      pathToWorkflow = match[1];
    } else {
      alert('Invalid workflow reference!');
    }
  
    const githubRef = githubWorkflowReference.split('@')[1];

    const githubWorkflowUrl = `https://github.com/${repository}/blob/${githubRef}/${pathToWorkflow}`;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.update(tabs[0].id, { url: githubWorkflowUrl });
      }
    });
  }
});
