---
description: "Action: Streamlined documentation update process ensuring alignment between code, specifications, and project management."
---

# Documentation Update Process

## 1. Task Management Protocol

### Master Tasks vs. Development Tasks

| File | Location | Purpose | Maintained By | Update Frequency |
|------|----------|---------|---------------|------------------|
| `master-tasks.md` | `docs/status/` | High-level project tracking | Project Manager | Daily/Weekly |
| `tasks.md` | `.kiro/specs/project-name/` | Detailed technical tasks | Tech Lead | As needed |

### Update Triggers

#### For `master-tasks.md`:
- [ ] Sprint planning/retrospective meetings
- [ ] Major milestone completion
- [ ] Resource allocation changes
- [ ] Priority shifts
- [ ] Progress updates (>10% change)

#### For `tasks.md`:
- [ ] New feature implementation
- [ ] Bug fixes requiring doc updates
- [ ] Architecture changes
- [ ] API modifications
- [ ] Dependency updates

### Synchronization Checklist
- [ ] Task IDs match across files
- [ ] Status changes are reflected in both
- [ ] Consistent terminology used
- [ ] Cross-references are maintained
- [ ] Review during sprint planning

## 2. Documentation Areas

### 2.1 Source of Truth (SoT)
```
.kiro/
├── specs/           # Technical specifications
│   ├── api/         # API contracts
│   ├── data/        # Database schemas
│   └── arch/        # Architecture decisions
└── steering/        # Project governance
    ├── adr/        # Architecture Decision Records
    └── strategy/   # Product strategy
```

### 2.2 Project Documentation
```
docs/
├── guides/         # How-to guides
├── security/       # Security policies
├── specs/          # Public specifications
├── status/         # Project status
└── templates/      # Documentation templates
```

## 3. Update Workflow

### 3.1 Pre-Update Checklist
- [ ] Review recent commits and PRs
- [ ] Check open documentation issues
- [ ] Verify build status is green
- [ ] Backup current documentation

### 3.2 Update Process

#### For Each Document:
1. **Verify Accuracy**
   ```bash
   # Check for broken links
   npm run docs:check-links
   
   # Validate code examples
   npm run test:examples
   ```

2. **Update Content**
   - Update version numbers and dates
   - Add/remove sections as needed
   - Verify all examples work
   - Update screenshots/diagrams

3. **Quality Check**
   ```bash
   # Lint documentation
   npm run docs:lint
   
   # Check for dead links
   npm run docs:deadlinks
   ```

### 3.3 Version Control
```bash
# Create update branch
git checkout -b docs/update-$(date +%Y%m%d)

# Commit changes
git add .
git commit -m "docs: update [component] documentation"

# Push and create PR
git push -u origin docs/update-$(date +%Y%m%d)
```

## 4. Automation

### 4.1 Required Scripts
- `scripts/docs-validate.sh` - Validate documentation structure
- `scripts/update-version.sh` - Update version numbers
- `scripts/generate-changelog.sh` - Generate changelog

### 4.2 CI/CD Integration
```yaml
# .github/workflows/docs.yml
name: Documentation
on:
  push:
    paths:
      - 'docs/**'
      - '.github/workflows/docs.yml'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18.x'
      - run: npm ci
      - run: npm run docs:build
      - run: npm run docs:test
```

## 5. Review Process

### 5.1 Self-Review
- [ ] All links work
- [ ] Code examples run
- [ ] No TODOs without owners
- [ ] Version numbers updated
- [ ] Changelog entries added

### 5.2 Peer Review
- Required approvers:
  - 1 Technical Lead
  - 1 Domain Expert
  - 1 Documentation Specialist

## 6. Release Process

### 6.1 Versioning
- Follow Semantic Versioning (SemVer)
- Update in `package.json` and `docs/CHANGELOG.md`
- Tag release with `vX.Y.Z`

### 6.2 Publication
- Push to main branch
- Create GitHub release
- Update documentation site
- Notify stakeholders

## 7. Maintenance

### 7.1 Monitoring
- Broken link checker (weekly)
- Outdated content scanner (monthly)
- Documentation health score (quarterly)

### 7.2 Cleanup
- Archive old versions
- Remove deprecated content
- Update indexes and navigation

## 8. Templates

### 8.1 New Document Template
```markdown
---
title: "Document Title"
description: "Brief description"
version: 1.0.0
last_updated: YYYY-MM-DD
---

# Title

## Overview
[Document purpose and scope]

## Details
[Main content]

## Related Documents
- [Related Doc 1](#)
- [Related Doc 2](#)

## Changelog
| Version | Date       | Description          | Author         |
|---------|------------|----------------------|----------------|
| 1.0.0   | YYYY-MM-DD | Initial version      | [@username]    |
```

## 9. Common Scenarios

### 9.1 API Changes
1. Update OpenAPI/Swagger spec
2. Update API reference
3. Update example code
4. Update version number
5. Update migration guide

### 9.2 Feature Addition
1. Add feature documentation
2. Update getting started guide
3. Add examples
4. Update API reference
5. Add to changelog

## 10. Troubleshooting

### Common Issues
1. **Broken Links**
   ```bash
   # Find broken links
   npm run docs:check-links
   ```

2. **Version Conflicts**
   - Check `package.json`
   - Update version references
   - Clear local caches

3. **Build Failures**
   - Check Node.js version
   - Verify dependencies
   - Check for file permission issues

## Support
For documentation issues, contact:
- **Documentation Lead**: @doc-lead
- **Technical Writers**: @tech-writers
- **Emergency**: #docs-support on Slack
