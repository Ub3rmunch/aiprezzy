import React, { useState, useEffect } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

// Contextual thoughts based on transitions (from → to)
const transitionThoughts = {
  // Starting the workflow
  '-1_0': "Alright, let's check this Jira ticket... 📋",
  '0_1': "Better read the Confluence docs first 📚",
  '1_2': "Now let's see what design wants... 🎨",
  '2_3': "Time to code this beautiful design! 💻",
  
  // The dreaded iteration loop
  '3_4': "Let's see if this actually works... 🤞",
  '4_5': "Running tests before I get too excited... ✅",
  '5_3': "Tests failed! Back to debugging... 🐛",
  '4_3': "Simulator crashed. Classic. 💥",
  '3_3': "Still coding... still coding... 😮‍💨",
  '4_4': "Why is the simulator so slow? 🐌",
  '5_5': "Re-running tests... again... 🔄",
  
  // Design comparison
  '4_2': "Wait, does this match the design? 🤔",
  '2_4': "Let me test this design in the simulator 📱",
  
  // AI interactions - Copy/paste era
  '3_9': "Let me ask AI for help... 🤖",
  '9_3': "Copy, paste, pray it works 🙏",
  '4_9': "AI, why isn't this working? 😭",
  '9_4': "Let's test what AI gave me... 🎲",
  '5_9': "Tests failed, asking AI for fix... 🆘",
  '9_5': "Running tests on AI's code... 🤞",
  '2_9': "Maybe AI knows about this design pattern? 💡",
  '9_2': "AI says check the Figma file again 🎨",
  
  // Wrapping up
  '3_6': "Time to commit this masterpiece! 💾",
  '5_6': "All green! Committing before it breaks! 🏃‍♂️",
  '6_7': "Pushing to GitHub... 🚀",
  '7_8': "Let me tell the team I'm a hero! 😎",
  '8_8': "Everyone's congratulating me! 🎉",
  
  // PR flow
  '7_3': "Handling PR comments... again 😤",
  '7_2': "Reviewer wants design changes 🙄",
  '8_3': "Team found a bug in Slack 🐛",
  
  // Documentation checks
  '3_1': "Wait, how does this work again? 📖",
  '1_3': "Okay NOW I can code it properly! 💡",
  '0_3': "Skipping docs, I got this! 😎",
  
  // Level-specific variations
  level_0: {
    '3_4': "Manual testing... for the 47th time 😩",
    '4_5': "Please pass, please pass... 🙏",
    '5_3': "Another failure. Why did I become a dev? 💀",
    '4_3': "Back to Xcode... AGAIN 🔄",
    '3_5': "Writing tests manually like a caveman 🦴",
  },
  level_1: {
    '3_4': "Testing without AI help... 😓",
    '4_3': "Still doing everything myself 💪",
  },
  level_2: {
    '3_9': "Let me copy some code from AI... 📋",
    '9_3': "Pasting AI's code... fingers crossed 🤞",
    '9_9': "What should I ask next? 🤷",
  },
  level_3: {
    '3_9': "AI, fix this one tiny thing! 🔨",
    '9_3': "That didn't work. Let me try again... 🤦",
    '9_9': "Should I ask AI again? Yes. Yes I should. 🔄",
    '3_3': "Wait, what was I doing? 😵‍💫",
    '9_4': "Did AI's change work? Probably not... 😬",
  },
  level_4: {
    '2_9': "Giving AI all the context it needs... 📝",
    '1_9': "AI, here's the full context from docs 📚",
    '9_9': "AI is cooking with full context! 👨‍🍳",
    '9_3': "AI nailed it! Just reviewing the code... 👀",
    '9_4': "Let's verify AI's work in simulator 🔍",
    '3_4': "AI wrote solid code, testing now ✨",
  },
  level_5: {
    '0_9': "AI, read the ticket and handle everything 🎩",
    '9_9': "AI is handling it all. Time for coffee ☕",
    '9_7': "AI finished! Just need to review the PR... 🧐",
    '7_8': "AI did 95% of the work. I'm just the messenger! 📨",
    '9_3': "AI already wrote the code. Just checking... 👌",
  }
};

const tools = [
  { name: 'Jira', emoji: '📋', logo: '/logos/jira.png' },
  { name: 'Confluence', emoji: '📚', logo: '/logos/confluence.png' },
  { name: 'Figma', emoji: '🎨', logo: '/logos/figma.png' },
  { name: 'Xcode', emoji: '💻', logo: '/logos/xcode.png' },
  { name: 'Simulator', emoji: '📱', logo: '/logos/simulator.png' },
  { name: 'Tests', emoji: '✅', logo: '/logos/tests.png' },
  { name: 'Git', emoji: '🔀', logo: '/logos/git.png' },
  { name: 'GitHub', emoji: '🐙', logo: '/logos/github.png' },
  { name: 'Slack', emoji: '💬', logo: '/logos/slack.png' },
  { name: 'AI', emoji: '🤖', logo: '/logos/claude.png' }
];

// AI logos per level: Level 2 = ChatGPT, Level 3 = Copilot, Levels 4-5 = Claude
const aiLogos = {
  0: '/logos/claude.png',  // Level 1 - no AI used, but default to claude
  1: '/logos/chatgpt.png', // Level 2 - Copy/Paste AI
  2: '/logos/copilot.png', // Level 3 - Inefficient (WORST!)
  3: '/logos/claude.png',  // Level 4 - Efficient AI
  4: '/logos/claude.png'   // Level 5 - God Mode
};

const levels = [
  {
    name: "LEVEL 1: NO AI",
    workflow: [0, 1, 2, 3, 4, 5, 3, 4, 5, 3, 4, 5, 3, 4, 5, 3, 4, 5, 3, 4, 5, 3, 4, 5, 3, 4, 5, 6, 7, 8],
    duration: 400,
    description: "8-10 ITERATION CYCLES"
  },
  {
    name: "LEVEL 2: COPY/PASTE AI",
    workflow: [0, 1, 2, 3, 9, 3, 4, 5, 3, 9, 3, 4, 5, 3, 4, 5, 3, 4, 5, 3, 4, 5, 6, 7, 8],
    duration: 350,
    description: "6-7 CYCLES"
  },
  {
    name: "LEVEL 3: INEFFICIENT (WORST!)",
    workflow: [0, 1, 2, 9, 3, 9, 3, 9, 4, 9, 3, 5, 9, 3, 9, 4, 5, 9, 3, 4, 5, 6, 7, 8],
    duration: 350,
    description: "TOO MUCH SWITCHING"
  },
  {
    name: "LEVEL 4: EFFICIENT AI",
    workflow: [0, 1, 2, 9, 9, 9, 3, 4, 5, 3, 4, 5, 6, 7, 8],
    duration: 400,
    description: "2-3 CYCLES"
  },
  {
    name: "LEVEL 5: GOD MODE",
    workflow: [0, 9, 9, 9, 9, 7, 8],
    duration: 500,
    description: "AI DOES EVERYTHING"
  }
];

const slides = [
  {
    title: "You're Asking for a Faster Horse",
    items: ["Optimizing old workflow", "Not fundamentally changing", "Be the 'Jake' of workflow", "Most work = mapping states"]
  },
  {
    title: "Mistake #1: Tools, Not Context",
    items: ["Switching models constantly", "No personal instructions", "No project .md files", "Context > prompts"]
  },
  {
    title: "Mistake #2: Not Using Claude Code",
    items: ["Terminal already open", "Bash access", "Parallelization", "Planning mode", "Subagents"]
  },
  {
    title: "Mistake #3: No Feedback Loop",
    items: ["Generative: You test", "Agentic: AI tests", "Stop being the loop"]
  },
  {
    title: "Mistake #4: Copy/Paste",
    items: ["Stop: Copy → Paste", "Use: MCPs", "Confluence, Jira, Figma", "GitHub CLI, Simulator"]
  },
  {
    title: "Mistake #5: Jump to Code",
    items: ["Wrong: Build X → broken", "Right: Plan first", "Use AI to learn"]
  },
  {
    title: "Things YOU Try",
    items: ["Personal instructions", "Set up MCPs", "Claude Code", "Planning mode", "Ask: 'Avoid forever?'"]
  },
  {
    title: "Things GUILD Tries",
    items: ["Documentation (.md)", "Build/test guides", "Design system docs", "Use AI as tooling"]
  },
  {
    title: "Start Today",
    items: ["Create .claud file", "Pick ONE repeated problem", "Think: solve forever?", "Share wins"]
  }
];

export default function WorkflowVisualization() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentStep, setCurrentStep] = useState(-1); // Start at -1 so Mario begins off-screen
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSlides, setShowSlides] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [coins, setCoins] = useState(0);
  const [isClimbingFlag, setIsClimbingFlag] = useState(false);
  const [flagProgress, setFlagProgress] = useState(0);
  const [hitBlocks, setHitBlocks] = useState(new Set());

  const currentWorkflow = levels[currentLevel].workflow;
  const currentTool = currentStep >= 0 ? currentWorkflow[currentStep] : null;
  const isComplete = currentStep >= currentWorkflow.length - 1 && !isPlaying;

  // Get tool with level-specific AI logo
  const getToolWithLevelLogo = (toolIndex) => {
    const tool = tools[toolIndex];
    if (tool.name === 'AI') {
      return { ...tool, logo: aiLogos[currentLevel] };
    }
    return tool;
  };

  // Block positions (x positions as percentages) - even spacing to avoid overlap
  const blockPositions = [8, 15, 22, 29, 36, 43, 50, 57, 64, 71];

  useEffect(() => {
    if (!showSlides && isPlaying) {
      const timer = setTimeout(() => {
        if (currentStep < currentWorkflow.length - 1) {
          setIsJumping(true);
          setCurrentStep(currentStep + 1);
          setCoins(coins + 10);
          if (currentStep >= 0) {
            setHitBlocks(new Set([...hitBlocks, currentTool]));
          }
        } else {
          setIsPlaying(false);
          setIsClimbingFlag(true);
          if (currentTool !== null) {
            setHitBlocks(new Set([...hitBlocks, currentTool]));
          }
        }
      }, levels[currentLevel].duration);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isPlaying, currentWorkflow, currentLevel, showSlides, coins, currentTool, hitBlocks]);

  // Separate effect to reset jump
  useEffect(() => {
    if (isJumping && !isClimbingFlag) {
      const jumpTimer = setTimeout(() => {
        setIsJumping(false);
      }, 300);
      return () => clearTimeout(jumpTimer);
    }
  }, [isJumping, isClimbingFlag]);

  useEffect(() => {
    if (isClimbingFlag && flagProgress < 100) {
      const timer = setTimeout(() => {
        setFlagProgress(flagProgress + 3);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isClimbingFlag, flagProgress]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showSlides) {
        if (e.key === 'ArrowLeft' && currentSlide > 0) {
          setCurrentSlide(currentSlide - 1);
        } else if (e.key === 'ArrowRight' && currentSlide < slides.length - 1) {
          setCurrentSlide(currentSlide + 1);
        } else if (e.key === 'Escape') {
          setShowSlides(false);
        }
      } else {
        if (e.key === 'ArrowLeft' && currentLevel > 0) {
          setCurrentLevel(currentLevel - 1);
          setCurrentStep(-1);
          setIsPlaying(false);
          setCoins(0);
          setIsClimbingFlag(false);
          setFlagProgress(0);
          setHitBlocks(new Set());
        } else if (e.key === 'ArrowRight' && currentLevel < levels.length - 1) {
          setCurrentLevel(currentLevel + 1);
          setCurrentStep(-1);
          setIsPlaying(false);
          setCoins(0);
          setIsClimbingFlag(false);
          setFlagProgress(0);
          setHitBlocks(new Set());
        } else if (e.key === ' ') {
          e.preventDefault();
          if (!isComplete) {
            setIsPlaying(!isPlaying);
          } else {
            setCurrentStep(-1);
            setIsPlaying(true);
            setIsClimbingFlag(false);
            setFlagProgress(0);
            setHitBlocks(new Set());
          }
        } else if (e.key === 'Enter') {
          setShowSlides(true);
          setCurrentSlide(0);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentLevel, isPlaying, currentSlide, showSlides, isComplete]);

  if (showSlides) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white p-8 flex flex-col items-center justify-center">
        <div className="max-w-4xl w-full">
          <h1 className="text-6xl font-bold mb-12 text-center" style={{ fontFamily: 'monospace', textShadow: '4px 4px 0 #000' }}>
            {slides[currentSlide].title}
          </h1>
          <ul className="space-y-6 text-3xl" style={{ fontFamily: 'monospace' }}>
            {slides[currentSlide].items.map((item, idx) => (
              <li key={idx} className="flex items-start">
                <span className="mr-4">★</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-12 text-center text-xl text-gray-300" style={{ fontFamily: 'monospace' }}>
            <p>SLIDE {currentSlide + 1} OF {slides.length}</p>
            <p className="mt-2">← → NAVIGATE • ESC FOR GAME</p>
          </div>
        </div>
      </div>
    );
  }

  const marioXPosition = currentStep < 0 ? -10 : blockPositions[currentTool];
  const marioFacingRight = currentStep <= 0 || (currentStep > 0 && blockPositions[currentTool] >= blockPositions[currentWorkflow[currentStep - 1]]);
  const prevTool = currentStep > 0 ? currentWorkflow[currentStep - 1] : -1;
  
  // Get current thought based on transition
  const getCurrentThought = () => {
    if (currentTool === null || isClimbingFlag) return null;
    
    // Create transition key: previousTool_currentTool
    const transitionKey = `${prevTool}_${currentTool}`;
    
    // Check for level-specific transition thought first
    const levelKey = `level_${currentLevel}`;
    if (transitionThoughts[levelKey]?.[transitionKey]) {
      return transitionThoughts[levelKey][transitionKey];
    }
    
    // Then check general transition thought
    if (transitionThoughts[transitionKey]) {
      return transitionThoughts[transitionKey];
    }
    
    // Fallback to tool-specific thought
    return tools[currentTool]?.thought || "Hmm... what's next? 🤔";
  };
  
  const currentThought = getCurrentThought();

  return (
    <div className="h-screen bg-gradient-to-b from-blue-400 via-blue-300 to-blue-500 p-4 overflow-hidden relative" style={{ imageRendering: 'pixelated' }}>
      {/* Background hills */}
      <div className="absolute bottom-20 left-10 pointer-events-none">
        <img
          src="/assets/hills.png"
          alt="Hills"
          className="w-48 h-auto"
          style={{ imageRendering: 'pixelated', opacity: 0.7 }}
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Combined HUD and Controls */}
        <div className="mb-4 bg-black text-white p-3 rounded-lg border-4 border-white shadow-2xl" style={{ fontFamily: 'monospace' }}>
          {/* Score Bar */}
          <div className="flex justify-between items-center mb-3 pb-3 border-b-2 border-gray-700">
            <div className="flex gap-8">
              <div>
                <div className="text-sm text-gray-400">WORLD</div>
                <div className="text-2xl font-bold">{currentLevel + 1}-1</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">SCORE</div>
                <div className="text-2xl font-bold text-yellow-400">{coins.toString().padStart(6, '0')}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">TIME</div>
                <div className="text-2xl font-bold text-green-400">{Math.max(0, 999 - currentStep * 3).toString().padStart(3, '0')}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">{levels[currentLevel].name}</div>
              <div className="text-sm text-yellow-400">{levels[currentLevel].description}</div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-center items-center gap-6 text-sm">
            <button
              onClick={() => {
                if (!isComplete) {
                  setIsPlaying(!isPlaying);
                } else {
                  setCurrentStep(-1);
                  setIsPlaying(true);
                  setIsClimbingFlag(false);
                  setFlagProgress(0);
                  setHitBlocks(new Set());
                }
              }}
              className="px-6 py-2 bg-gradient-to-b from-red-500 to-red-700 text-white font-bold rounded border-2 border-red-900 hover:from-red-600 hover:to-red-800 transition transform hover:scale-105 active:scale-95"
            >
              <div className="flex items-center gap-2">
                {!isComplete && (isPlaying ? <Pause size={16} /> : <Play size={16} />)}
                <span>{isComplete ? 'RESTART' : isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-2xl">◀</span>
              <span className="font-bold">PREV LEVEL</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">⎵</span>
              <span className="font-bold">PLAY/PAUSE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">NEXT LEVEL</span>
              <span className="text-2xl">▶</span>
            </div>

            <button
              onClick={() => setShowSlides(true)}
              className="px-6 py-2 bg-gradient-to-b from-yellow-400 to-yellow-600 text-black font-bold rounded border-2 border-yellow-800 hover:from-yellow-500 hover:to-yellow-700 transition transform hover:scale-105 active:scale-95"
            >
              SLIDES
            </button>
          </div>
        </div>

        {/* Clouds - positioned after combined bar */}
        <div className="relative h-24 mb-4">
          <div className="absolute top-2 left-10">
            <img
              src="/assets/cloud1.png"
              alt="Cloud"
              className="w-24 h-auto"
              style={{ imageRendering: 'pixelated', opacity: 0.9 }}
            />
          </div>
          <div className="absolute top-6 right-20">
            <img
              src="/assets/cloud2.png"
              alt="Cloud"
              className="w-24 h-auto"
              style={{ imageRendering: 'pixelated', opacity: 0.9 }}
            />
          </div>
          <div className="absolute top-0 left-1/3">
            <img
              src="/assets/cloud1.png"
              alt="Cloud"
              className="w-24 h-auto"
              style={{ imageRendering: 'pixelated', opacity: 0.9 }}
            />
          </div>
        </div>

        {/* Mario's thoughts - play by play (conversation bubble) */}
        <div className="bg-white/90 rounded-xl p-6 border-4 border-gray-800 shadow-2xl mb-6 min-h-32 flex items-center justify-center">
          {currentThought && currentStep >= 0 ? (
            <div className="text-center max-w-3xl">
              <div className="flex items-center justify-center gap-3 mb-3">
                {prevTool >= 0 && prevTool !== currentTool && (
                  <>
                    <img
                      src={getToolWithLevelLogo(prevTool)?.logo}
                      alt={getToolWithLevelLogo(prevTool)?.name}
                      className="w-10 h-10 object-contain"
                    />
                    <span className="text-3xl">→</span>
                    <img
                      src={getToolWithLevelLogo(currentTool)?.logo}
                      alt={getToolWithLevelLogo(currentTool)?.name}
                      className="w-10 h-10 object-contain"
                    />
                  </>
                )}
                {(prevTool === -1 || prevTool === currentTool) && (
                  <img
                    src={getToolWithLevelLogo(currentTool)?.logo}
                    alt={getToolWithLevelLogo(currentTool)?.name}
                    className="w-12 h-12 object-contain"
                  />
                )}
              </div>
              <p className="text-2xl font-bold" style={{ fontFamily: 'monospace' }}>
                "{currentThought}"
              </p>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <div className="text-5xl mb-3">{isComplete ? '🎉' : '🏃'}</div>
              <p className="text-xl font-bold mb-2" style={{ fontFamily: 'monospace' }}>
                {isComplete
                  ? (currentLevel === 0 ? "Finally done... that was painful 😮‍💨"
                     : currentLevel === 1 ? "Done! AI helped a bit 🤷"
                     : currentLevel === 2 ? "Finished! But that was chaotic 🤪"
                     : currentLevel === 3 ? "Done efficiently! Context is key 👑"
                     : "That was easy! AI did everything 😎")
                  : "Press PLAY to start the workflow!"}
              </p>
              {isComplete && (
                <p className="text-sm text-gray-500">
                  Hit RESTART or try the next level →
                </p>
              )}
            </div>
          )}
        </div>

        {/* Game area */}
        <div className="relative h-96 mb-6 overflow-visible">
          {/* Mario brick blocks floating above */}
          <div className="absolute top-32 left-0 right-0">
            {tools.map((tool, idx) => {
              const isActive = currentTool === idx;
              const wasHit = hitBlocks.has(idx);
              const toolWithLevelLogo = getToolWithLevelLogo(idx);

              return (
                <div
                  key={idx}
                  className="absolute"
                  style={{
                    left: `${blockPositions[idx]}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  {/* Coin popup when hit */}
                  {isActive && isJumping && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-3xl animate-bounce">
                      🪙
                    </div>
                  )}

                  {/* Brick block or Logo */}
                  <div
                    className="relative"
                    style={{
                      width: '48px',
                      height: '48px',
                      transform: isActive && isJumping ? 'translateY(-8px)' : 'translateY(0)',
                      transition: 'transform 150ms'
                    }}
                  >
                    {/* Flying brick image when not hit */}
                    {!wasHit && (
                      <img
                        src="/assets/flyingbrickquestionmark.png"
                        alt="Question Block"
                        className="w-full h-full object-contain"
                        style={{
                          imageRendering: 'pixelated'
                        }}
                      />
                    )}

                    {/* Show only logo when hit - no brick background */}
                    {wasHit && (
                      <img
                        src={toolWithLevelLogo.logo}
                        alt={toolWithLevelLogo.name}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  
                  {/* Name label only when active */}
                  {isActive && (
                    <div 
                      className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 text-white px-2 py-1 rounded text-xs font-bold"
                      style={{ fontFamily: 'monospace' }}
                    >
                      {tool.name.toUpperCase()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mario walking and jumping */}
          <div
            className={isClimbingFlag ? 'absolute z-20' : 'absolute z-20'}
            style={{
              right: isClimbingFlag ? '26px' : 'auto',
              left: isClimbingFlag ? 'auto' : `${marioXPosition}%`,
              bottom: isClimbingFlag ? `${80 + (flagProgress * 3)}px` : (isJumping ? '128px' : '64px'),
              transition: 'left 500ms ease-in-out, right 500ms ease-in-out, bottom 300ms ease-in-out',
              width: '48px',
              height: '48px',
              transform: isClimbingFlag
                ? `scaleX(1)`
                : `translateX(-50%) scaleX(${marioFacingRight ? 1 : -1})`,
              filter: 'drop-shadow(2px 2px 0 rgba(0,0,0,0.3))'
            }}
          >
            <img
              src={isClimbingFlag ? "/assets/mario.png" : (isJumping ? "/assets/mariojumping.png" : "/assets/mario.png")}
              alt="Mario"
              className="w-full h-full object-contain"
            />
          </div>
          {/* Ground - two rows of bricks */}
          <div
            className="absolute bottom-0"
            style={{
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100vw',
              height: '64px',
              zIndex: 1
            }}
          >
            {/* Two rows of ground bricks */}
            <div className="absolute bottom-0 w-full h-full flex flex-col">
              {/* Top row */}
              <div className="flex-1 flex">
                {[...Array(Math.ceil(window.innerWidth / 32))].map((_, i) => (
                  <img
                    key={`top-${i}`}
                    src="/assets/groundbrick.png"
                    alt="Ground"
                    className="w-8 h-8 flex-shrink-0"
                    style={{ imageRendering: 'pixelated' }}
                  />
                ))}
              </div>
              {/* Bottom row */}
              <div className="flex-1 flex">
                {[...Array(Math.ceil(window.innerWidth / 32))].map((_, i) => (
                  <img
                    key={`bottom-${i}`}
                    src="/assets/groundbrick.png"
                    alt="Ground"
                    className="w-8 h-8 flex-shrink-0"
                    style={{ imageRendering: 'pixelated' }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Flag pole with ground tile underneath */}
          <div className="absolute bottom-16 right-5 flex flex-col items-center" style={{ zIndex: 30 }}>
            {/* Pole and flag */}
            <div className="relative flex flex-col items-center" style={{ height: '320px' }}>
              {/* Green dot on top */}
              <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-green-700 mb-1 z-10" />

              {/* Green pole */}
              <div
                className="w-2 flex-1 bg-green-600 border-2 border-green-800"
                style={{ boxShadow: 'inset -1px 0 0 rgba(0,0,0,0.2)' }}
              />

              {/* Flag image - starts at top, slides down as Mario climbs */}
              <img
                src="/assets/flag.png"
                alt="Flag"
                className="absolute left-0"
                style={{
                  top: isClimbingFlag ? `${20 + (flagProgress * 2.5)}px` : '20px',
                  width: '48px',
                  height: 'auto',
                  transition: 'top 500ms',
                  imageRendering: 'pixelated',
                  zIndex: 5
                }}
              />
            </div>

            {/* Ground tile under pole */}
            <img
              src="/assets/groundbrick.png"
              alt="Ground Tile"
              className="w-12 h-12 object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}