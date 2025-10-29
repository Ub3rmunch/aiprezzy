# Development Guide

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- React development environment

## Project Structure

```
aiprezzy/
├── workflow_viz.tsx    # Main React component with visualization logic
├── README.md           # Project overview and documentation
└── DEVELOPMENT.md      # This file - setup and development guide
```

## Setup

1. **Install Dependencies**

This component requires the following dependencies:

```bash
npm install react lucide-react
# or
yarn add react lucide-react
```

For TypeScript support:
```bash
npm install --save-dev @types/react
```

2. **Integration**

The `workflow_viz.tsx` component can be integrated into any React application:

```tsx
import WorkflowVisualization from './workflow_viz';

function App() {
  return <WorkflowVisualization />;
}
```

## Component Details

### WorkflowVisualization Component

The main component exports a default React functional component that handles:

- **State Management**: Level progression, animation state, Mario position
- **Keyboard Controls**: Arrow keys, spacebar, enter, escape
- **Animation Logic**: Timed progression through workflow steps
- **Visual Feedback**: Mario jumping, block changes, coin animations

### Key Features

1. **Tools Array** (lines 94-105)
   - 10 development tools represented as emoji icons
   - Jira, Confluence, Figma, Xcode, Simulator, Tests, Git, GitHub, Slack, AI

2. **Levels Configuration** (lines 107-138)
   - 5 distinct workflow levels
   - Each with unique workflow sequence
   - Duration and description metadata

3. **Transition Thoughts** (lines 5-92)
   - Contextual messages based on tool transitions
   - Level-specific variations
   - Realistic developer inner monologue

4. **Slides Content** (lines 140-177)
   - Educational content about AI workflow mistakes
   - Actionable recommendations for individuals and teams

## Styling

The component uses:
- **Tailwind CSS**: For responsive layout and styling
- **Inline Styles**: For dynamic animations and Mario-specific effects
- **Gradient Backgrounds**: Sky-blue theme mimicking classic Mario games
- **Pixel Art Aesthetics**: Monospace fonts, sharp edges, retro colors

## Testing

### Manual Testing Checklist

- [ ] Level switching with arrow keys works correctly
- [ ] Animation plays/pauses with spacebar
- [ ] Mario moves smoothly between blocks
- [ ] Blocks show correct emojis after being hit
- [ ] Coins increment properly
- [ ] Flag climbing animation triggers at completion
- [ ] Slides display with Enter key
- [ ] Slide navigation works with arrow keys
- [ ] Escape returns from slides to game

### Browser Compatibility

Tested and working in:
- Chrome/Edge (Chromium)
- Firefox
- Safari

## Customization

### Adding New Levels

To add a new level, update the `levels` array:

```typescript
{
  name: "LEVEL 6: YOUR LEVEL",
  workflow: [0, 1, 2, ...], // Tool indices
  duration: 400, // ms per step
  description: "YOUR DESCRIPTION"
}
```

### Modifying Tools

Edit the `tools` array to change tool names or emojis:

```typescript
{ name: 'Your Tool', emoji: '🔧' }
```

### Customizing Thoughts

Add new transition thoughts in the `transitionThoughts` object:

```typescript
'3_4': "Your custom thought! 💭",
```

Use the format `previousToolIndex_currentToolIndex` as the key.

## Performance Considerations

- The component uses `setTimeout` for animations rather than `setInterval` for better performance
- State updates are batched where possible
- No external animation libraries needed (pure CSS transitions)

## Known Issues

None currently. If you encounter issues:
1. Check browser console for errors
2. Verify React and dependencies are properly installed
3. Ensure Tailwind CSS is configured in your project

## Contributing

To modify this visualization:

1. Update the component file (`workflow_viz.tsx`)
2. Test all levels and transitions
3. Verify keyboard controls work correctly
4. Update documentation if adding new features

## Future Enhancements

Potential improvements:
- Add sound effects (Mario coin sound, jump sound)
- Export workflow data to JSON
- Add level editor mode
- Mobile touch controls
- Customizable color themes
- Save progress/scores to localStorage

## License

See main project README for license information.
