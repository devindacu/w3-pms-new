# Contributing to W3 Hotel PMS

Thank you for your interest in contributing to W3 Hotel PMS! This document provides guidelines and best practices for contributing to this project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Git Commit Guidelines](#git-commit-guidelines)
- [Branching Strategy](#branching-strategy)
- [Handling Merge Conflicts](#handling-merge-conflicts)
- [Pull Request Process](#pull-request-process)
- [Code Standards](#code-standards)
- [Testing](#testing)

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/w3-pms-new.git
   cd w3-pms-new
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/devindacu/w3-pms-new.git
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Development Workflow

### Creating a New Feature or Fix

1. **Sync with upstream:**
   ```bash
   git checkout main
   git pull upstream main
   ```

2. **Create a new branch:**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Make your changes** and commit them following our [commit guidelines](#git-commit-guidelines)

4. **Keep your branch up to date:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

5. **Push your changes:**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

## Git Commit Guidelines

We follow a structured commit message format to maintain a clear and readable git history.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (whitespace, formatting, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to build process or auxiliary tools
- **ci**: Changes to CI configuration files and scripts

### Scope

The scope should indicate the area of the codebase affected:
- `frontend`: Frontend office management
- `housekeeping`: Housekeeping module
- `fnb`: Food & Beverage module
- `crm`: Guest relations/CRM
- `finance`: Financial management
- `hr`: HR & Staff management
- `inventory`: Inventory & Procurement
- `analytics`: Analytics & Reporting
- `ui`: UI components
- `core`: Core functionality
- `config`: Configuration changes

### Examples

```
feat(frontend): add quick check-in functionality

Implement express check-in feature for guests with reservations.
- Add quick check-in button on reservations list
- Auto-assign available rooms based on preferences
- Generate welcome email automatically

Closes #123
```

```
fix(finance): correct invoice calculation for multiple taxes

The tax calculation was applying compound taxes incorrectly
when multiple tax rates were present on a single invoice.

Fixes #456
```

```
docs(readme): update installation instructions

Add clarification about Node.js version requirements
and troubleshooting section for common setup issues.
```

### Commit Best Practices

1. **Keep commits atomic**: Each commit should represent a single logical change
2. **Write clear messages**: Use imperative mood ("add feature" not "added feature")
3. **Reference issues**: Include issue numbers when applicable
4. **Keep the first line short**: 50 characters or less
5. **Add detailed body when needed**: Explain the "why" not just the "what"

## Branching Strategy

We use the following branch naming conventions:

- `feature/feature-name`: For new features
- `fix/bug-description`: For bug fixes
- `docs/documentation-update`: For documentation changes
- `refactor/component-name`: For refactoring work
- `test/test-description`: For adding or updating tests
- `chore/task-description`: For maintenance tasks

### Branch Naming Examples

- `feature/guest-loyalty-program`
- `fix/invoice-tax-calculation`
- `docs/contributing-guidelines`
- `refactor/housekeeping-task-assignment`

## Handling Merge Conflicts

When you encounter merge conflicts during development, follow these steps:

### During a Merge

1. **Identify conflicting files:**
   ```bash
   git status
   ```

2. **Open and resolve conflicts** in each file:
   - Look for conflict markers: `<<<<<<<`, `=======`, `>>>>>>>`
   - Edit the file to keep the desired changes
   - Remove the conflict markers

3. **Stage the resolved files:**
   ```bash
   git add path/to/resolved-file
   ```

4. **Complete the merge:**
   ```bash
   git commit
   ```
   Git will open your editor with a pre-filled commit message. You can edit it if needed, then save and close.

### During a Rebase

1. **Resolve conflicts** as described above

2. **Stage the resolved files:**
   ```bash
   git add path/to/resolved-file
   ```

3. **Continue the rebase:**
   ```bash
   git rebase --continue
   ```

4. **If you want to abort the rebase:**
   ```bash
   git rebase --abort
   ```

### Conflict Resolution Tips

- **Understand both changes**: Read the code from both versions before deciding
- **Test after resolving**: Always run tests after resolving conflicts
- **Communicate**: If unsure, reach out to the original author
- **Use visual tools**: Consider using `git mergetool` or IDE merge tools
- **Keep commits clean**: Avoid including unrelated changes in conflict resolutions

### Common Conflict Scenarios

**Scenario 1: Merge conflict during pull**
```bash
git pull upstream main
# Conflicts appear
# Resolve conflicts in files
git add .
git commit -m "Merge upstream changes and resolve conflicts"
```

**Scenario 2: Rebase conflict**
```bash
git rebase upstream/main
# Conflicts appear
# Resolve conflicts in files
git add .
git rebase --continue
# Repeat for each conflicting commit
```

**Scenario 3: Cherry-pick conflict**
```bash
git cherry-pick <commit-hash>
# Conflicts appear
# Resolve conflicts in files
git add .
git cherry-pick --continue
```

## Pull Request Process

1. **Ensure your code follows our standards:**
   - Run linting: `npm run lint`
   - Build successfully: `npm run build`
   - All tests pass (if applicable)

2. **Update documentation** if you've changed functionality

3. **Create a clear PR description:**
   - Explain what changes you made and why
   - Reference related issues
   - Include screenshots for UI changes
   - List any breaking changes

4. **PR Title Format:**
   Follow the same format as commit messages:
   ```
   feat(module): brief description of changes
   ```

5. **Request review** from maintainers

6. **Address review feedback** promptly
   - Make requested changes in new commits
   - Push to the same branch
   - Respond to comments

7. **Squash commits** if requested before merging

### PR Checklist

Before submitting a pull request, ensure:

- [ ] Code follows the project's style guidelines
- [ ] Self-review of code has been performed
- [ ] Comments added for complex logic
- [ ] Documentation updated if needed
- [ ] No new warnings or errors introduced
- [ ] Tests added/updated for changes (if applicable)
- [ ] All tests passing
- [ ] Commit messages follow guidelines
- [ ] PR description is clear and complete

## Code Standards

### TypeScript

- Use TypeScript strict mode
- Define proper types, avoid `any`
- Use interfaces for object shapes
- Follow existing naming conventions

### React

- Use functional components with hooks
- Keep components focused and small
- Use proper prop types
- Follow React best practices

### Styling

- Use Tailwind CSS utility classes
- Follow the existing component patterns
- Ensure responsive design
- Test on different screen sizes

### File Organization

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   └── [Module].tsx    # Feature modules
├── hooks/              # Custom React hooks
├── lib/                # Utilities and types
└── styles/             # CSS files
```

### Code Quality

- Write self-documenting code
- Add comments for complex logic only
- Follow DRY (Don't Repeat Yourself)
- Keep functions small and focused
- Use meaningful variable names

## Testing

While testing infrastructure is being developed, ensure manual testing of:

1. **Functionality**: Feature works as expected
2. **Edge cases**: Handle errors and unusual inputs
3. **Responsiveness**: Works on mobile and desktop
4. **Browser compatibility**: Test in major browsers
5. **Offline mode**: Critical features work offline

### Manual Testing Checklist

- [ ] Feature works in Chrome
- [ ] Feature works in Firefox
- [ ] Feature works in Safari
- [ ] Mobile responsive design verified
- [ ] Error states handled properly
- [ ] Loading states display correctly
- [ ] Data persists across page reloads
- [ ] Offline functionality tested (if applicable)

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Create a GitHub Issue with detailed reproduction steps
- **Security**: Review SECURITY.md for reporting vulnerabilities
- **General**: Reach out to maintainers

## Code Review Process

All submissions require review. We aim to provide feedback within:
- **Critical fixes**: 24 hours
- **Features**: 2-3 days
- **Documentation**: 1-2 days

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes for significant contributions
- Special thanks in documentation

Thank you for contributing to W3 Hotel PMS! 🎉
