# Contributing to Halloween Costume Contest App 🎃

Thank you for your interest in contributing to the Halloween Costume Contest App! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Firebase account (for testing)

### Development Setup

1. **Fork and Clone**

   ```bash
   git clone https://github.com/your-username/halloween-costume-contest.git
   cd halloween-costume-contest
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set up Environment**

   ```bash
   cp .env.example .env.local
   # Add your Firebase configuration
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🎯 How to Contribute

### Types of Contributions

- 🐛 **Bug Fixes** - Fix existing issues
- ✨ **New Features** - Add new functionality
- 📚 **Documentation** - Improve docs and README
- 🎨 **UI/UX** - Enhance user interface
- ⚡ **Performance** - Optimize app performance
- 🧪 **Testing** - Add or improve tests
- 🔧 **Refactoring** - Improve code quality

### Contribution Process

1. **Check Issues**
   - Look for existing issues or create a new one
   - Comment on issues you want to work on

2. **Create Branch**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-number
   ```

3. **Make Changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Test your changes

4. **Commit Changes**

   ```bash
   git add .
   git commit -m "feat: add new costume category feature"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Code Style Guidelines

### JavaScript/React

- Use functional components with hooks
- Follow React best practices
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### CSS/Styling

- Use Tailwind CSS classes
- Follow mobile-first responsive design
- Use CSS custom properties for theming
- Keep styles organized and modular

### File Organization

- Use descriptive file names
- Group related files in folders
- Keep components small and focused
- Use index files for clean imports

## 🧪 Testing

### Running Tests

```bash
npm run test        # Run all tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Writing Tests

- Test user interactions
- Test component rendering
- Test error handling
- Test accessibility features

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Description** - Clear description of the issue
2. **Steps to Reproduce** - Detailed steps to reproduce
3. **Expected Behavior** - What should happen
4. **Actual Behavior** - What actually happens
5. **Environment** - Browser, OS, device info
6. **Screenshots** - If applicable

### Bug Report Template

```markdown
## Bug Description

Brief description of the bug

## Steps to Reproduce

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior

What you expected to happen

## Actual Behavior

What actually happened

## Environment

- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 22]

## Additional Context

Any other context about the problem
```

## ✨ Feature Requests

When requesting features, please include:

1. **Feature Description** - Clear description of the feature
2. **Use Case** - Why this feature would be useful
3. **Proposed Solution** - How you think it should work
4. **Alternatives** - Other solutions you've considered

### Feature Request Template

```markdown
## Feature Description

Brief description of the feature

## Use Case

Why would this feature be useful?

## Proposed Solution

How should this feature work?

## Alternatives

What other solutions have you considered?

## Additional Context

Any other context or screenshots
```

## 🎨 Design Guidelines

### Halloween Theme

- Use spooky, fun colors (orange, purple, black)
- Include Halloween icons and imagery
- Maintain dark theme aesthetic
- Use appropriate fonts and animations

### Accessibility

- Ensure keyboard navigation works
- Use proper ARIA labels
- Maintain good color contrast
- Test with screen readers

### Responsive Design

- Mobile-first approach
- Test on various screen sizes
- Ensure touch targets are appropriate
- Optimize for different devices

## 📋 Pull Request Guidelines

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] No linting errors
- [ ] Documentation updated
- [ ] Screenshots added (if UI changes)

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing (if applicable)

## Screenshots

Add screenshots if UI changes

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
```

## 🏷️ Commit Message Convention

Use conventional commits format:

```
type(scope): description

feat(auth): add social login options
fix(voting): resolve vote counting bug
docs(readme): update installation instructions
style(ui): improve button hover effects
refactor(api): simplify costume service
test(auth): add login component tests
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## 🎃 Halloween Spirit

Remember to keep the Halloween spirit alive in your contributions:

- Use spooky variable names when appropriate
- Add Halloween-themed comments
- Include fun animations and effects
- Keep the app festive and engaging

## 📞 Getting Help

If you need help:

- Check existing issues and discussions
- Join our community chat
- Contact maintainers
- Read the documentation

## 🙏 Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to the Halloween Costume Contest App! 🎃👻🦇
