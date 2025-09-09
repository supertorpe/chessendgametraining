---
description: "Action: Set up a new project with standardized structure, documentation, and automation."
---

# New Project Onboarding Guide

## Prerequisites

- [ ] Git installed locally
- [ ] Access to project repository
- [ ] Required permissions in CI/CD systems
- [ ] Team communication channels set up

## 1. Repository Setup

### Initialize Repository
```bash
# Create new directory
mkdir project-name
cd project-name

# Initialize git
git init

# Set up .gitignore
curl -o .gitignore https://raw.githubusercontent.com/github/gitignore/main/Node.gitignore  # Example for Node.js

# Add remote origin
git remote add origin git@github.com:org/project-name.git
```

### Directory Structure
```
project-name/
├── .github/               # GitHub workflows and templates
├── .kiro/                 # Source of Truth (SoT) specifications
│   ├── specs/             # Technical specifications
│   └── steering/          # Governance and decision records
├── docs/                  # Public-facing documentation
│   ├── _assets/           # Images and media
│   ├── guides/            # How-to guides
│   ├── security/          # Security policies and docs
│   └── status/            # Project status and dashboards
├── scripts/               # Utility scripts
├── src/                   # Source code
├── tests/                 # Test files
└── .gitignore
```

## 2. Core Documentation

### Project Dashboard (`docs/status/PROJECT_DASHBOARD.md`)
```markdown
# Project Dashboard

## Project Overview
- **Name**: Project Name
- **Repository**: [github.com/org/project-name](https://github.com/org/project-name)
- **Status**: 🟢 Active
- **Version**: 0.1.0

## Quick Links
- [Development Status](./DEVELOPMENT_STATUS.md)
- [Master Tasks](./master-tasks.md)
- [API Documentation](./api/README.md)

## Team
- **Product Owner**: @user1
- **Tech Lead**: @user2
- **Developers**: @user3, @user4

## Key Metrics
- Test Coverage: 0%
- Open Issues: 0
- Last Release: Not released yet
```

### Development Status (`docs/status/DEVELOPMENT_STATUS.md`)
```markdown
# Development Status

## Current Phase
🚀 Initial Setup

## Technology Stack
- **Backend**: Node.js, Express
- **Frontend**: React, TypeScript
- **Database**: PostgreSQL
- **Infrastructure**: Docker, Kubernetes

## Milestones
- [ ] Project setup (Due: YYYY-MM-DD)
- [ ] MVP Development
- [ ] Beta Release
- [ ] Production Launch
```

## 3. Configuration Files

### ALIAS_MAP.json
```json
{
  "README": "/README.md",
  "DASHBOARD": "/docs/status/PROJECT_DASHBOARD.md",
  "STATUS": "/docs/status/DEVELOPMENT_STATUS.md",
  "TASKS": "/docs/status/master-tasks.md"
}
```

### INDEX_MAP.md
```markdown
# Documentation Index

## Project
- [Project Dashboard](status/PROJECT_DASHBOARD.md)
- [Development Status](status/DEVELOPMENT_STATUS.md)
- [Master Tasks](status/master-tasks.md)

## Technical
- [API Documentation](api/README.md)
- [Architecture](architecture/OVERVIEW.md)

## Guides
- [Getting Started](guides/GETTING_STARTED.md)
- [Development Workflow](guides/DEVELOPMENT.md)
```

## 4. Automation Setup

### Required Scripts
```bash
# Create scripts directory
mkdir -p scripts

# Add common scripts
touch scripts/{
  setup.sh,          # Project setup
  test.sh,           # Run tests
  lint.sh,           # Lint code
  build.sh,          # Build project
  deploy.sh,         # Deploy to staging/prod
  validate-docs.sh   # Validate documentation
}

# Make scripts executable
chmod +x scripts/*.sh
```

### GitHub Workflow (`.github/workflows/ci-cd.yml`)
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16.x'
    - run: npm ci
    - run: npm test
    - run: npm run build
```

## 5. Project Initialization

### Dependencies
```bash
# For Node.js project
npm init -y
npm install express react react-dom typescript
npm install --save-dev jest @types/node @types/react

# Create basic files
touch src/index.ts src/App.tsx
```

### First Commit
```bash
git add .
git commit -m "Initial project setup"

git branch -M main
git push -u origin main
```

## 6. Team Onboarding

### Developer Setup
1. Clone the repository
2. Run setup script: `./scripts/setup.sh`
3. Start development server: `npm run dev`
4. Open http://localhost:3000

### Required Tools
- Node.js 16+
- Docker (if using containers)
- IDE Extensions:
  - ESLint
  - Prettier
  - EditorConfig

## 7. Next Steps

### Immediate Actions
- [ ] Set up CI/CD pipelines
- [ ] Configure monitoring
- [ ] Initialize test suite
- [ ] Document architecture

### First Week Goals
- [ ] Complete project setup
- [ ] Set up development environment
- [ ] Create initial documentation
- [ ] Define first sprint backlog

## Support
For help, contact:
- **Tech Lead**: @user2
- **DevOps**: @devops-team
- **Documentation**: @docs-team

## 8. Documentation Templates

### Getting Started Guide (`docs/guides/GETTING_STARTED.md`)
```markdown
# Getting Started

## Prerequisites
- Node.js 16+ and npm
- Git
- Docker (for containerized development)

## Local Development

### First-time Setup
```bash
# Clone the repository
git clone git@github.com:org/project-name.git
cd project-name

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Running the Application
```bash
# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Project Structure
- `src/` - Application source code
- `tests/` - Test files
- `docs/` - Project documentation
- `scripts/` - Development and build scripts

## Need Help?
- Check the [Project Dashboard](./status/PROJECT_DASHBOARD.md)
- Review [Development Status](./status/DEVELOPMENT_STATUS.md)
- Ask in #project-support on Slack
```

## 9. Advanced Configuration

### Environment Variables
Create a `.env` file in the project root:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
API_BASE_URL=http://localhost:3000/api
```

### VS Code Settings (`.vscode/settings.json`)
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["javascript", "typescript", "javascriptreact", "typescriptreact"]
}
```

## 10. Quality Assurance

### Code Quality
- ESLint for JavaScript/TypeScript linting
- Prettier for code formatting
- EditorConfig for consistent editor settings

### Testing Strategy
- Unit tests with Jest
- Integration tests with Supertest
- E2E tests with Cypress
- Test coverage reporting

## 11. Deployment

### Staging Deployment
```bash
# Deploy to staging
npm run deploy:staging

# Run staging tests
npm run test:staging
```

### Production Deployment
```bash
# Deploy to production
npm run deploy:production

# Monitor deployment
npm run monitor:deployment
```

## 12. Maintenance

### Dependency Updates
- Weekly dependency updates using Dependabot
- Security vulnerability scanning with npm audit
- Deprecation warnings monitoring

### Performance Monitoring
- Application performance monitoring
- Error tracking
- Usage analytics

## 13. Support and Resources

### Documentation
- [API Reference](./api/README.md)
- [Architecture Guide](./architecture/OVERVIEW.md)
- [Deployment Guide](./deployment/GUIDE.md)

### Support Channels
- **Slack**: #project-support
- **Email**: support@project.org
- **Issue Tracker**: [GitHub Issues](https://github.com/org/project-name/issues)

### Emergency Contacts
- **Production Issues**: @oncall-engineer
- **Security Issues**: security@project.org

## 14. Compliance and Security

### Security Best Practices
- Regular security audits
- Dependency vulnerability scanning
- Secrets management
- Access control and permissions

### Compliance Requirements
- GDPR compliance
- Accessibility standards (WCAG 2.1)
- Performance benchmarks

## 15. Project Handoff

### Knowledge Transfer
1. Schedule handoff meeting with new team
2. Document system architecture
3. Share access credentials securely
4. Provide contact information for key stakeholders

### Exit Checklist
- [ ] Update documentation ownership
- [ ] Transfer repository access
- [ ] Update support contacts
- [ ] Archive project resources if needed
