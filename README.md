1. Type `gha`, then press tab;

2. Paste your workflow reference (you can use this for example: `thiagomarinho/gha-workflow-shortcut/.github/workflows/workflow.yml@main`);

3. Press enter!

OR

1. Select the reference:

```yaml
# workflows
uses: thiagomarinho/gha-workflow-shortcut/.github/workflows/workflow.yml@main
uses: thiagomarinho/gha-workflow-shortcut/.github/workflows/workflow.yml@v1.0.0

# actions
uses: thiagomarinho/gha-workflow-shortcut@main
uses: actions/checkout@v4
```

```hcl
# terraform modules
module "my_module" {
  source = "git::git@github.com:Github-Org/github-repo?ref=git-ref"
  # ...
}
```

2. Right-click on it;

3. Click on "Open workflow link"!