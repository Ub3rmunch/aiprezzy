# Service Logos

This directory contains official logo files for all services used in the AI Workflow Levels visualization.

## Downloaded Logos

| Service | File | Format | Source |
|---------|------|--------|--------|
| Jira | `jira.svg` | SVG | SimpleIcons CDN |
| Confluence | `confluence.svg` | SVG | SimpleIcons CDN |
| Figma | `figma.svg` | SVG | SimpleIcons CDN |
| Xcode | `xcode.svg` | SVG | SimpleIcons CDN |
| iOS Simulator | `simulator.png` | PNG | Apple Developer |
| Tests (pytest) | `tests.svg` | SVG | SimpleIcons CDN |
| Git | `git.svg` | SVG | SimpleIcons CDN |
| GitHub | `github.svg` | SVG | SimpleIcons CDN |
| Slack | `slack.svg` | SVG | SimpleIcons CDN |
| Claude AI (Anthropic) | `anthropic.svg` | SVG | SimpleIcons CDN |

## Usage

All SVG files have transparent backgrounds and are optimized for web use.
The simulator.png file is a PNG from Apple's developer assets.

## File Mapping for Code

Update the `tools` array in `src/workflow_viz.tsx`:

```typescript
const tools = [
  { name: 'Jira', logo: '/logos/jira.svg' },
  { name: 'Confluence', logo: '/logos/confluence.svg' },
  { name: 'Figma', logo: '/logos/figma.svg' },
  { name: 'Xcode', logo: '/logos/xcode.svg' },
  { name: 'Simulator', logo: '/logos/simulator.png' },
  { name: 'Tests', logo: '/logos/tests.svg' },
  { name: 'Git', logo: '/logos/git.svg' },
  { name: 'GitHub', logo: '/logos/github.svg' },
  { name: 'Slack', logo: '/logos/slack.svg' },
  { name: 'AI', logo: '/logos/anthropic.svg' }
];
```
