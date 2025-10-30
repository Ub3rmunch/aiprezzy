import { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface Mushroom {
  id: number;
  fromTool: number;
  toTool: number;
  progress: number;
  returning: boolean;
  cycleCount: number;
  maxCycles: number;
  visitedServices?: Set<number>;
  assignedServices?: number[];
  currentServiceIndex?: number;
  totalServices?: number;
  speed?: number;
  targetSequence?: number[];
  currentTargetIndex?: number;
}

const transitionThoughts = {
  // Starting the workflow
  '-1_0': "Alright, let's check this Jira ticket...",
  '0_1': "Better read the Confluence docs first. Or not?",
  '1_2': "Now let's see what design wants... hopefully it's clear.",
  '2_3': "Time to code this beautiful design! Wish me luck.",

  // The dreaded iteration loop
  '3_4': "Let's see if this actually works... fingers crossed.",
  '4_5': "Running tests before I get too excited... again.",
  '5_3': "Tests failed! Back to debugging... this is getting old.",
  '4_3': "Simulator crashed. Classic. Why always me?",
  '3_3': "Still coding... still coding... is this even progress?",
  '4_4': "Why is the simulator so slow? My patience is wearing thin.",
  '5_5': "Re-running tests... again... and again. This is fine.",

  // Design comparison
  '4_2': "Wait, does this match the design? Let me double check.",
  '2_4': "Let me test this design in the simulator. Hope it looks good.",

  // AI interactions - Copy/Pasta era
  '3_9': "Let me ask AI for help... maybe it knows.",
  '9_3': "Copy, paste, pray it works. The usual.",
  '4_9': "AI, why isn't this working? Are you even trying?",
  '9_4': "Let's test what AI gave me... probably needs tweaking.",
  '5_9': "Tests failed, asking AI for fix... again. This is frustrating.",
  '9_5': "Running tests on AI's code... please be right this time.",
  '2_9': "Maybe AI knows about this design pattern? Worth a shot.",
  '9_2': "AI says check the Figma file again. Seriously?",

  // Wrapping up
  '3_6': "Time to commit this masterpiece! Finally.",
  '5_6': "All green! Committing before it breaks! Phew.",
  '6_7': "Pushing to GitHub... hope the CI passes.",
  '7_8': "Let me tell the team I'm a hero! They'll never know the struggle.",
  '8_8': "Everyone's congratulating me! I deserve this.",

  // PR flow
  '7_3': "Handling PR comments... again. Can't they just approve?",
  '7_2': "Reviewer wants design changes. Back to Figma.",
  '8_3': "Team found a bug in Slack. My 'masterpiece' has a flaw.",

  // Documentation checks
  '3_1': "Wait, how does this work again? I should have read the docs.",
  '1_3': "Okay NOW I can code it properly! Hopefully.",
  '0_3': "Skipping docs, I got this! (Narrator: He did not got this.)",

  // Level-specific variations
  level_0: { // NO AI
    '-1_0': "Another day, another Jira ticket. Manual labor, here I come.",
    '3_4': "Manual testing... for the 47th time. My eyes hurt.",
    '4_5': "Please pass, please pass... I can't take another failure.",
    '5_3': "Another failure. Why did I become a dev? This is soul-crushing.",
    '4_3': "Back to Xcode... AGAIN. This loop is endless.",
    '3_5': "Writing tests manually like a caveman. There has to be a better way.",
    '0_1': "Confluence docs are always outdated. Guess I'll just wing it.",
    '1_2': "Design specs are vague. Time to guess what they want.",
    '3_6': "Finally done coding this. My fingers are tired.",
    '5_6': "All tests passed! A miracle! Committing before I jinx it.",
    '7_3': "PR comments are piling up. This is going to be a long day.",
  },
  level_1: { // COPY/PASTA AI
    '-1_0': "Jira ticket. Time to find some code snippets online.",
    '3_9': "Let me copy some code from AI... hope it's relevant.",
    '9_3': "Pasting AI's code... fingers crossed. It's a gamble.",
    '9_9': "What should I ask next? AI, give me more options!",
    '4_9': "AI, why isn't this working? Your code is supposed to be smart!",
    '9_4': "Let's test what AI gave me... probably still broken.",
    '5_9': "Tests failed, asking AI for fix... this is getting repetitive.",
    '9_5': "Running tests on AI's code... again. Is this progress?",
    '3_3': "Still trying to make AI's code work. My brain hurts.",
    '7_3': "PR comments on AI's code. Explaining AI's logic is hard.",
  },
  level_2: { // AGENTIC LVL 1
    '-1_0': "Jira ticket. Time to delegate to my AGENTIC LVL 1.",
    '3_9': "AI, fix this one tiny thing! Don't mess it up.",
    '9_3': "That didn't work. Let me try again... with more specific instructions.",
    '9_9': "Should I ask AI again? Yes. Yes I should. But with more context.",
    '3_3': "Wait, what was I doing? AI, remind me of the task.",
    '9_4': "Did AI's change work? Probably not... but let's check.",
    '4_9': "AI, this is still broken. What's going on?",
    '5_9': "Tests failed. AI, analyze the failure and suggest a fix.",
    '9_5': "Running AI's suggested fix. Hope it's better this time.",
    '7_3': "PR comments. AI, help me address these efficiently.",
  },
  level_3: { // AGENTIC LVL 2
    '-1_0': "Jira ticket. My AGENTIC LVL 2 will handle this.",
    '2_9': "Giving AI all the context it needs... it should get this.",
    '1_9': "AI, here's the full context from docs. Don't miss anything.",
    '9_9': "AI is cooking with full context! This should be good.",
    '9_3': "AI nailed it! Just reviewing the code... impressive.",
    '9_4': "Let's verify AI's work in simulator. Looking promising.",
    '3_4': "AI wrote solid code, testing now. Smooth sailing.",
    '5_9': "Tests failed. AI, self-correct and re-run.",
    '9_5': "AI self-corrected and tests passed! Amazing.",
    '7_3': "PR comments are minimal. AI, generate responses.",
  },
  level_4: { // ENDGAME
    '-1_0': "Jira ticket. AI, read the ticket and handle everything. I'm on break.",
    '0_9': "AI, read the ticket and handle everything. I'm just supervising.",
    '9_9': "AI is handling it all. Time for coffee and memes.",
    '9_7': "AI finished! Just need to review the PR... almost hands-off.",
    '7_8': "AI did 95% of the work. I'm just the messenger! And the approver.",
    '9_3': "AI already wrote the code. Just checking... perfect as always.",
    '3_4': "AI handled the coding and testing. My job is easy now.",
    '5_6': "AI passed all tests and committed. What a time to be alive.",
    '6_8': "AI pushed to GitHub and notified the team. I'm a genius for hiring AI.",
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
  1: '/logos/chatgpt.png', // Level 2 - Copy/Pasta AI
  2: '/logos/copilot.png', // Level 3 - AGENTIC LVL 1
  3: '/logos/claude.png',  // Level 4 - AGENTIC LVL 2
  4: '/logos/claude.png'   // Level 5 - ENDGAME
};

const levels = [
  {
    name: "NO AI",
    workflow: [0, 1, 2, 3, 4, 5, 3, 4, 5, 3, 4, 5, 3, 4, 5, 3, 4, 5, 3, 4, 5, 3, 4, 5, 3, 4, 5, 6, 7, 8],
    duration: 400,

  },
  {
    name: "COPY/PASTA AI",
    workflow: [0, 1, 2, 3, 9, 3, 4, 5, 3, 9, 3, 4, 5, 3, 4, 5, 3, 4, 5, 3, 4, 5, 6, 7, 8],
    duration: 350,
    description: "6-7 CYCLES"
  },
  {
    name: "AGENTIC LVL 1",
    workflow: [0, 1, 2, 9, 3, 9, 3, 9, 4, 9, 3, 5, 9, 3, 9, 4, 5, 9, 3, 4, 5, 6, 7, 8],
    duration: 350,
    description: "TOO MUCH SWITCHING"
  },
  {
    name: "AGENTIC LVL 2",
    workflow: [1, 9, 3, 4, 9, 3, 4, 9, 6, 7, 8],
    duration: 455,
    description: "2-3 CYCLES"
  },
  {
    name: "ENDGAME",
    workflow: [0, 9, 7, 8],
    duration: 500,
    description: "AI DOES EVERYTHING"
  }
];

const slides = [
  {
    title: "Usecases (beyond implementing a feature)",
    items: [
      "Use AI to learn (Learn backend, or... science forbid... Android)",
      "Use AI to find organizational knowledge (Search unfamiliar codebases, Confluence, Slack, Snowflake)",
      "Use AI to improve AI",
      "Make cool presentations",
      "Debugging"
    ],
    subitems: {
      2: ["Fix your own setup issues (installing MCPs, weird Node errors, etc.)", "Dump session learnings into your personal instruction file", "Build complex commands"],
      4: ["Comb through logs, events, and data tables"]
    }
  },
  {
    title: "Things You Should Know",
    items: [
      "It won't make you implement things faster *in abstract*. It frees you to do important work while *it* handles the slow parts.",
      "Context Engineering: \"Prompt Engineering is giving the AI a task. Context Engineering is giving the AI an office to work in.\"",
      "Context window limitations",
      "Wise tooling (and its limitations/restrictions)"
    ]
  },
  {
    title: "Things You Should Try",
    items: [
      "Documentation first",
      "Stop re-prompting. Ask: \"How can I avoid this forever?\"",
      "Build a beefy personal instructions file",
      "Use CLI-based agents (Claude Code, Gemini CLI, etc.)",
      "Use MCPs and CLIs",
      "Use 'plan mode'",
      "Use subagents",
      "Create custom commands",
      "Embrace parallelization",
      "--dangerously-skip-permissions"
    ]
  },
  {
    title: "How the Guild Can Help",
    items: [
      "Create more .md files",
      "Push for modularization and feature apps",
      "Use AI to create tooling",
      "Use AI *as* tooling (for deprecations, migrations, env setup, UI tests)"
    ],
    subitems: {
      0: [
        "How to use the design system",
        "How to compile and run tests (and avoid timeouts)",
        "What our frameworks do",
        "How to write tests",
        "How to read awkward code (macros, Prism, etc.)",
        "A Guild Swift style guide"
      ]
    }
  }
];

export default function WorkflowVisualization() {
  const [showIntro, setShowIntro] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentStep, setCurrentStep] = useState(-1); // Start at -1 so Mario begins off-screen
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSlides, setShowSlides] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [coins, setCoins] = useState(0);
  const [isClimbingFlag, setIsClimbingFlag] = useState(false);
  const [flagProgress, setFlagProgress] = useState(0);
  const [hitBlocks, setHitBlocks] = useState(new Set<number>());
  const [activeMushrooms, setActiveMushrooms] = useState<Mushroom[]>([]);
  const [isMarioChilling, setIsMarioChilling] = useState(false);

  const currentWorkflow = levels[currentLevel].workflow;
  const currentTool = currentStep >= 0 ? currentWorkflow[currentStep] : null;
  const isComplete = currentStep >= currentWorkflow.length - 1 && !isPlaying;

  // Get tool with level-specific AI logo
  const getToolWithLevelLogo = (toolIndex: number) => {
    const tool = tools[toolIndex];
    if (tool.name === 'AI') {
      return { ...tool, logo: (aiLogos as Record<number, string>)[currentLevel] || '/logos/claude.png' };
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
          const nextStep = currentStep + 1;
          const nextTool = currentWorkflow[nextStep];

          setCurrentStep(nextStep);
          setCoins(coins + 10);
          if (currentStep >= 0 && currentTool !== null) {
            setHitBlocks(new Set([...hitBlocks, currentTool]));
          }

          // Level 5: Switch Mario to chill mode after touching AI
          if (currentLevel === 4 && nextTool === 9) {
            setIsMarioChilling(true);
          }

          // Spawn mushrooms for agentic levels (3, 4, 5)
          if (currentLevel >= 2 && currentTool === 9 && nextTool !== 9) {
            // Level 3 (index 2): Spawn mushroom from AI to current target
            // Level 4 (index 3): Spawn mushroom from AI to specific targets (Simulator, Tests, Git)
            // Level 5 (index 4): Spawn 3 mushrooms to simulate parallel tasks - multiple cycles
            const newMushrooms = [];

            if (currentLevel === 4) {
              // Level 5: Spawn 3 mushrooms that will collectively visit ALL services
              // Each mushroom gets assigned specific services to ensure full coverage
              const allServices = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // Jira, Confluence, Figma, Xcode, Simulator, Tests, Git, GitHub, Slack

              // Distribute services across 3 mushrooms to ensure all are visited
              const mushroomAssignments = [
                [0, 3, 6],       // Mushroom 1: Jira, Xcode, Git
                [1, 4, 7],       // Mushroom 2: Confluence, Simulator, GitHub
                [2, 5, 8]        // Mushroom 3: Figma, Tests, Slack
              ];

              // Helper function to shuffle an array
              const shuffleArray = (array: number[]): number[] => {
                const shuffled = [...array];
                for (let i = shuffled.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                return shuffled;
              };

              for (let i = 0; i < 3; i++) {
                const mushroomId = Date.now() + i;
                // Shuffle the assigned services for random order
                const assignedServices = shuffleArray(mushroomAssignments[i]);
                const initialTarget = assignedServices[0];

                // Random speed between 1.5 and 3.5 for varied movement
                const randomSpeed = 1.5 + Math.random() * 2;
                // Random initial progress offset to stagger starts (0-40%)
                const randomStartOffset = Math.random() * 40;

                newMushrooms.push({
                  id: mushroomId,
                  fromTool: 9, // AI
                  toTool: initialTarget,
                  progress: randomStartOffset, // Start at random progress for staggered effect
                  returning: false,
                  cycleCount: 0,
                  maxCycles: 1, // Only 1 cycle per target (no repeat visits)
                  visitedServices: new Set<number>(), // Track visited services
                  assignedServices: assignedServices, // Services this mushroom must visit (in random order)
                  currentServiceIndex: 0, // Index in assignedServices
                  totalServices: allServices.length,
                  speed: randomSpeed // Each mushroom moves at different speed
                });
              }
            } else if (currentLevel === 3) {
              // Level 4: Multiple mushrooms with different sequences showing parallel work
              // Mario touches AI 3 times, spawning different tasks each time
              const mushroomSequences = [
                [1, 0, 2], // First touch: Confluence → Jira → Figma (gather requirements)
                [5, 3, 4], // Second touch: Tests → Xcode → Simulator (run tests and verify)
                [6, 7]     // Third touch: Git → GitHub (commit and push)
              ];

              // Determine which sequence based on how many times AI has been touched
              const aiTouchCount = currentWorkflow.slice(0, nextStep).filter(tool => tool === 9).length;
              const sequenceIndex = aiTouchCount - 1; // 0-indexed

              if (sequenceIndex >= 0 && sequenceIndex < mushroomSequences.length) {
                const targetSequence = mushroomSequences[sequenceIndex];
                const mushroomId = Date.now();

                newMushrooms.push({
                  id: mushroomId,
                  fromTool: 9, // AI
                  toTool: targetSequence[0],
                  progress: 0,
                  returning: false,
                  cycleCount: 0,
                  maxCycles: 1,
                  targetSequence: targetSequence,
                  currentTargetIndex: 0
                });
              }
            } else {
              // Level 3: Single mushroom to current target
              const mushroomId = Date.now();
              newMushrooms.push({
                id: mushroomId,
                fromTool: 9, // AI
                toTool: nextTool,
                progress: 0,
                returning: false,
                cycleCount: 0,
                maxCycles: 1
              });
            }

            setActiveMushrooms([...activeMushrooms, ...newMushrooms]);
          }
        } else {
          setIsPlaying(false);
          setIsClimbingFlag(true);
          setActiveMushrooms([]); // Clear all mushrooms when Mario reaches the flag
          if (currentTool !== null) {
            setHitBlocks(new Set([...hitBlocks, currentTool]));
          }
        }
      }, levels[currentLevel].duration);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isPlaying, currentWorkflow, currentLevel, showSlides, coins, currentTool, hitBlocks, activeMushrooms]);

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

  // Weighted random selection helper function (for use in effects)
  const getWeightedRandomTarget = (availableServices: number[], level: number): number => {
    // For levels 4 and 5 (indices 3 and 4), use weighted selection
    if (level >= 3) {
      // Create weighted array where Xcode and Simulator appear more frequently
      const weighted: number[] = [];
      availableServices.forEach((service: number) => {
        // Xcode (3) and Simulator (4) get 5x weight, others get 1x weight
        const weight = (service === 3 || service === 4) ? 5 : 1;
        for (let i = 0; i < weight; i++) {
          weighted.push(service);
        }
      });
      return weighted[Math.floor(Math.random() * weighted.length)];
    } else {
      // Level 3 uses unweighted random selection
      return availableServices[Math.floor(Math.random() * availableServices.length)];
    }
  };

  // Animate mushrooms
  useEffect(() => {
    if (activeMushrooms.length === 0) return;

    const timer = setInterval(() => {
      setActiveMushrooms(prevMushrooms => {
        const updated: Mushroom[] = [];
        const toReveal: number[] = [];

        prevMushrooms.forEach(mushroom => {
          let newMushroom = { ...mushroom };

          if (mushroom.returning) {
            // Returning to AI
            const speed = mushroom.speed || 2; // Use mushroom's speed or default to 2
            newMushroom.progress = mushroom.progress + speed;
            if (newMushroom.progress >= 100) {
              // Reached AI
              if (mushroom.assignedServices !== undefined && mushroom.currentServiceIndex !== undefined) {
                // Level 5: Move to next assigned service
                const nextIndex = mushroom.currentServiceIndex + 1;

                if (nextIndex < mushroom.assignedServices.length) {
                  // Move to next assigned service
                  newMushroom.currentServiceIndex = nextIndex;
                  newMushroom.toTool = mushroom.assignedServices[nextIndex];
                  newMushroom.progress = 0;
                  newMushroom.returning = false;
                  newMushroom.cycleCount = 0;
                  updated.push(newMushroom);
                }
                // Otherwise mushroom disappears (visited all assigned services)
              } else if (mushroom.visitedServices !== undefined) {
                // Level 5 fallback (old logic): Pick a weighted random unvisited target (favor Xcode and Simulator)
                const allServices = [0, 1, 2, 3, 4, 5, 6, 7, 8];
                const unvisited = allServices.filter(s => !mushroom.visitedServices!.has(s));

                if (unvisited.length > 0) {
                  // Pick weighted random unvisited service
                  const randomTarget = getWeightedRandomTarget(unvisited, currentLevel);
                  newMushroom.toTool = randomTarget;
                  newMushroom.progress = 0;
                  newMushroom.returning = false;
                  newMushroom.cycleCount = 0;
                  updated.push(newMushroom);
                }
                // Otherwise mushroom disappears (visited all targets)
              } else if (mushroom.targetSequence !== undefined && mushroom.currentTargetIndex !== undefined) {
                // Level 4: Move to next target in sequence
                const nextIndex = mushroom.currentTargetIndex + 1;
                if (nextIndex < mushroom.targetSequence.length) {
                  newMushroom.currentTargetIndex = nextIndex;
                  newMushroom.toTool = mushroom.targetSequence[nextIndex];
                  newMushroom.progress = 0;
                  newMushroom.returning = false;
                  updated.push(newMushroom);
                }
                // Otherwise mushroom disappears (completed all targets in sequence)
              } else {
                // Level 3: Check if we need to do another cycle
                newMushroom.cycleCount = mushroom.cycleCount + 1;
                if (newMushroom.cycleCount < mushroom.maxCycles) {
                  // Start another cycle: go back to target
                  newMushroom.progress = 0;
                  newMushroom.returning = false;
                  updated.push(newMushroom);
                }
                // Otherwise mushroom disappears (completed all cycles)
              }
            } else {
              updated.push(newMushroom);
            }
          } else {
            // Going to target
            const speed = mushroom.speed || 2; // Use mushroom's speed or default to 2
            newMushroom.progress = mushroom.progress + speed;
            if (newMushroom.progress >= 100) {
              // Reached target
              toReveal.push(mushroom.toTool);

              // Mark service as visited for Level 5
              if (mushroom.visitedServices !== undefined) {
                newMushroom.visitedServices = new Set([...mushroom.visitedServices, mushroom.toTool]);
              }

              // For levels 4 and 5, mushrooms return to AI
              if (currentLevel >= 3) {
                newMushroom.progress = 0;
                newMushroom.returning = true;
                updated.push(newMushroom);
              }
              // For level 3, mushrooms disappear
            } else {
              updated.push(newMushroom);
            }
          }
        });

        // Reveal target blocks
        if (toReveal.length > 0) {
          setHitBlocks(prev => {
            const newSet = new Set(prev);
            toReveal.forEach(tool => newSet.add(tool));
            return newSet;
          });
        }

        return updated;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [activeMushrooms, currentLevel]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showIntro) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setShowIntro(false);
        }
      } else if (showSlides) {
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
          setActiveMushrooms([]);
          setIsMarioChilling(false);
        } else if (e.key === 'ArrowRight' && currentLevel < levels.length - 1) {
          setCurrentLevel(currentLevel + 1);
          setCurrentStep(-1);
          setIsPlaying(false);
          setCoins(0);
          setIsClimbingFlag(false);
          setFlagProgress(0);
          setHitBlocks(new Set());
          setActiveMushrooms([]);
          setIsMarioChilling(false);
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
            setActiveMushrooms([]);
            setIsMarioChilling(false);
          }
        } else if (e.key === 'Enter') {
          setShowSlides(true);
          setCurrentSlide(0);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentLevel, isPlaying, currentSlide, showSlides, showIntro, isComplete]);

  // Intro screen
  if (showIntro) {
    return (
      <div className="h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{
        imageRendering: 'pixelated',
        backgroundColor: '#5C94FC'
      }}>
        {/* Mario-style title card */}
        <div className="text-center">
          {/* Title banner */}
          <div className="relative inline-block mb-16">
            <div className="px-16 py-12 border-8 border-black" style={{
              backgroundColor: '#DC5148',
              boxShadow: '0 0 0 4px white, 0 0 0 8px black'
            }}>
              <h1 className="text-7xl font-bold tracking-wider mb-4" style={{
                fontFamily: 'monospace',
                color: 'white',
                textShadow: '4px 4px 0 #000',
                letterSpacing: '0.05em'
              }}>
                YOU'RE USING
              </h1>
              <h1 className="text-8xl font-bold tracking-wider" style={{
                fontFamily: 'monospace',
                color: '#FFE69C',
                textShadow: '4px 4px 0 #000',
                letterSpacing: '0.05em'
              }}>
                AI WRONG
              </h1>
            </div>
            {/* Corner screws */}
            <div className="absolute top-2 left-2 w-4 h-4 rounded-full" style={{ backgroundColor: '#4A4A4A', border: '2px solid #2A2A2A' }}></div>
            <div className="absolute top-2 right-2 w-4 h-4 rounded-full" style={{ backgroundColor: '#4A4A4A', border: '2px solid #2A2A2A' }}></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 rounded-full" style={{ backgroundColor: '#4A4A4A', border: '2px solid #2A2A2A' }}></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full" style={{ backgroundColor: '#4A4A4A', border: '2px solid #2A2A2A' }}></div>
          </div>

          {/* Copyright style text */}
          <p className="text-2xl mb-12" style={{
            fontFamily: 'monospace',
            color: '#7EC0EE',
            textShadow: '2px 2px 0 #000'
          }}>
            ©2025 AHMED SHAALAN
          </p>

          {/* Menu options */}
          <div className="space-y-4 mb-16">
            <div className="flex items-center justify-center gap-4">
              <img
                src="/assets/mario.png"
                alt="Mario"
                className="w-12 h-12"
                style={{ imageRendering: 'pixelated' }}
              />
              <p className="text-4xl font-bold" style={{
                fontFamily: 'monospace',
                color: 'white',
                textShadow: '3px 3px 0 #000'
              }}>
                PRESS START
              </p>
            </div>
          </div>

          {/* Instructions */}
          <p className="text-xl" style={{
            fontFamily: 'monospace',
            color: 'white',
            textShadow: '2px 2px 0 #000'
          }}>
            PRESS SPACE OR ENTER
          </p>
        </div>

        {/* Hills decoration */}
        <div className="absolute bottom-8 left-10">
          <div className="w-48 h-32 rounded-t-full" style={{ backgroundColor: '#00B800', border: '4px solid #008800' }}></div>
        </div>
        <div className="absolute bottom-8 right-20">
          <div className="w-32 h-24 rounded-t-full" style={{ backgroundColor: '#00B800', border: '4px solid #008800' }}></div>
        </div>

        {/* Ground decoration - pushed to very bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-8 flex" style={{ backgroundColor: '#000' }}>
          {[...Array(Math.ceil(window.innerWidth / 32))].map((_, i) => (
            <img
              key={i}
              src="/assets/groundbrick.png"
              alt="Ground"
              className="w-8 h-8 flex-shrink-0"
              style={{ imageRendering: 'pixelated' }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (showSlides) {
    const currentSlideData = slides[currentSlide];

    return (
      <div className="min-h-screen text-white p-8 flex flex-col items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #163300 0%, #2F5711 50%, #9FE870 100%)' }}>
        {/* Animated background elements - Wise secondary colors */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full blur-3xl animate-pulse" style={{ background: '#FFEB69' }}></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full blur-3xl animate-pulse" style={{ background: '#FFC091', animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full blur-3xl animate-pulse" style={{ background: '#A0E1E1', animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-5xl w-full relative z-10">
          {/* Title with enhanced styling */}
          <div className="mb-16">
            <h1
              className="text-6xl font-bold text-center leading-tight"
              style={{
                fontFamily: 'monospace',
                textShadow: '4px 4px 0 #163300, 2px 2px 20px rgba(159, 232, 112, 0.4)',
                letterSpacing: '-0.02em',
                color: '#FFFFFF'
              }}
            >
              {currentSlideData.title}
            </h1>
            <div className="h-2 mt-6 rounded-full" style={{ background: 'linear-gradient(90deg, transparent 0%, #9FE870 50%, transparent 100%)' }}></div>
          </div>

          {/* Content with nested structure */}
          <div className="space-y-5" style={{ fontFamily: 'monospace' }}>
            {currentSlideData.items.map((item, idx) => (
              <div key={idx} className="group">
                {/* Main item */}
                <div className="flex items-start backdrop-blur-sm rounded-xl p-5 border-2 transition-all duration-300" style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderColor: 'rgba(159, 232, 112, 0.2)'
                }}>
                  <span className="text-4xl mr-5 group-hover:scale-125 transition-transform duration-300" style={{ color: '#9FE870' }}>★</span>
                  <span className="text-2xl flex-1 leading-relaxed">{item}</span>
                </div>

                {/* Subitems if they exist */}
                {currentSlideData.subitems && (currentSlideData.subitems as unknown as Record<number, string[]>)[idx] && (
                  <div className="ml-16 mt-3 space-y-3">
                    {((currentSlideData.subitems as unknown as Record<number, string[]>)[idx]).map((subitem: string, subidx: number) => (
                      <div
                        key={subidx}
                        className="flex items-start rounded-lg p-4 border-l-4 transition-all duration-300"
                        style={{
                          background: 'linear-gradient(90deg, rgba(255, 192, 145, 0.15) 0%, transparent 100%)',
                          borderColor: '#FFC091'
                        }}
                      >
                        <span className="text-2xl mr-4" style={{ color: '#FFEB69' }}>▸</span>
                        <span className="text-xl leading-relaxed" style={{ color: '#E8F5E3' }}>{subitem}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation footer */}
          <div className="mt-16 pt-8 border-t-2" style={{ borderColor: 'rgba(159, 232, 112, 0.3)' }}>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold" style={{ fontFamily: 'monospace', color: '#9FE870' }}>
                SLIDE {currentSlide + 1} / {slides.length}
              </div>
              <div className="flex gap-8 text-xl" style={{ fontFamily: 'monospace' }}>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg border" style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(159, 232, 112, 0.3)'
                }}>
                  <span className="text-2xl">←</span>
                  <span>PREV</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg border" style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(159, 232, 112, 0.3)'
                }}>
                  <span>NEXT</span>
                  <span className="text-2xl">→</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg border" style={{
                  backgroundColor: 'rgba(168, 32, 13, 0.2)',
                  borderColor: 'rgba(168, 32, 13, 0.5)'
                }}>
                  <span>ESC</span>
                  <span className="text-sm">GAME</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const marioXPosition = currentStep < 0 || currentTool === null ? -10 : blockPositions[currentTool];
  const marioFacingRight = currentStep <= 0 || currentTool === null || (currentStep > 0 && blockPositions[currentTool] >= blockPositions[currentWorkflow[currentStep - 1]]);
  const prevTool = currentStep > 0 ? currentWorkflow[currentStep - 1] : -1;
  
  // Get current thought based on transition
  const getCurrentThought = () => {
    if (currentTool === null || isClimbingFlag) return null;

    // Create transition key: previousTool_currentTool
    const transitionKey = `${prevTool}_${currentTool}`;

    // Check for level-specific transition thought first
    const levelKey = `level_${currentLevel}` as keyof typeof transitionThoughts;
    if (transitionThoughts[levelKey] && typeof transitionThoughts[levelKey] === 'object') {
      const levelThoughts = transitionThoughts[levelKey] as Record<string, string>;
      if (levelThoughts[transitionKey]) {
        return levelThoughts[transitionKey];
      }
    }

    // Then check general transition thought
    const generalThought = (transitionThoughts as Record<string, string | object>)[transitionKey];
    if (typeof generalThought === 'string') {
      return generalThought;
    }

    // Fallback thought
    return "Hmm... what's next? 🤔";
  };
  
  const currentThought = getCurrentThought();

  return (
    <div className="h-screen bg-gradient-to-b from-blue-400 via-blue-300 to-blue-500 p-4 overflow-hidden relative" style={{ imageRendering: 'pixelated' }}>
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
                  setActiveMushrooms([]);
                  setIsMarioChilling(false);
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
        <div className="bg-white rounded-xl p-6 border-4 border-gray-800 shadow-2xl mb-6 flex items-center justify-center" style={{ minHeight: '160px', maxHeight: '160px' }}>
          {currentThought && currentStep >= 0 ? (
            <div className="text-center max-w-3xl">
              <div className="flex items-center justify-center mb-3">
                <img
                  src="/assets/mariolookingatcamera.png"
                  alt="Mario"
                  className="w-12 h-12 object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <p className="text-2xl font-bold" style={{ fontFamily: 'monospace' }}>
                "{currentThought}"
              </p>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <div className="flex items-center justify-center mb-3">
                <img
                  src="/assets/mariolookingatcamera.png"
                  alt="Mario"
                  className="w-12 h-12 object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <p className="text-xl font-bold mb-2" style={{ fontFamily: 'monospace' }}>
                {isComplete
                  ? (currentLevel === 0 ? "Finally done... that was painful 😮‍💨"
                     : currentLevel === 1 ? "Done! AI helped a bit 🤷"
                     : currentLevel === 2 ? "Finished! But that was chaotic 🤪"
                     : currentLevel === 3 ? "Done efficiently! Context is key 👑"
                     : "That was easy! AI did everything 😎")
                  : "Let's get some shit done!"}
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
            className={isClimbingFlag ? 'fixed z-20' : 'absolute z-20'}
            style={{
              right: isClimbingFlag ? '104px' : 'auto',
              left: isClimbingFlag ? 'auto' : `${marioXPosition}%`,
              bottom: isClimbingFlag ? `${90 + (flagProgress * 2.5)}px` : (isJumping ? '128px' : '106px'),
              transition: 'left 500ms ease-in-out, right 500ms ease-in-out, bottom 300ms ease-in-out',
              width: '48px',
              height: '48px',
              transform: isClimbingFlag
                ? `scaleX(-1)`
                : `translateX(-50%) scaleX(${marioFacingRight ? 1 : -1})`,
              filter: 'drop-shadow(2px 2px 0 rgba(0,0,0,0.3))'
            }}
          >
            <img
              src={isClimbingFlag ? "/assets/mario.png" : (isJumping ? "/assets/mariojumping.png" : (isMarioChilling ? "/assets/mariochill.png" : "/assets/mario.png"))}
              alt="Mario"
              className="w-full h-full object-contain"
            />
          </div>
          {/* Mushrooms */}
          {activeMushrooms.map((mushroom, idx) => {
            const fromX = blockPositions[mushroom.fromTool];
            const toX = blockPositions[mushroom.toTool];

            // Calculate position based on direction
            let currentX;
            if (mushroom.returning) {
              // Going back to AI
              const returnProgress = mushroom.progress;
              currentX = toX + (fromX - toX) * (returnProgress / 100);
            } else {
              // Going to target
              currentX = fromX + (toX - fromX) * (mushroom.progress / 100);
            }

            const yOffset = idx * 8; // Stagger vertically for multiple mushrooms

            return (
              <div
                key={mushroom.id}
                className="absolute z-30"
                style={{
                  left: `${currentX}%`,
                  top: `${60 + yOffset}px`, // Position above the tiles
                  transform: 'translateX(-50%)',
                  transition: 'left 30ms linear, top 30ms linear',
                  width: '32px',
                  height: '32px'
                }}
              >
                <img
                  src="/assets/mushroom.png"
                  alt="Mushroom"
                  className="w-full h-full object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            );
          })}

          {/* Ground - two rows of bricks */}
          <div
            className="fixed bottom-0"
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

        </div>
      </div>

      {/* Flag pole with ground tile underneath - positioned outside of max-w-5xl container */}
      <div className="fixed bottom-14 right-32 flex flex-col items-center" style={{ zIndex: 30 }}>
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
              width: '96px',
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
  );
}