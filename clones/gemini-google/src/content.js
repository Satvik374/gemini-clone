/* Every string and every list the pages render. Swap this one file to rebrand.
   Names, chats and notebooks here are placeholders — none of it is copied from
   the reference account that was observed. */
window.CONTENT = {
  brand: "Gemini",
  account: { name: "Alex Morgan", initials: "AM" },

  nav: [
    { id: "new", label: "New chat", href: "index.html", icon: "pen" },
    { id: "library", label: "Library", href: "library.html", icon: "grid" },
    { id: "images", label: "Images", href: "images.html", icon: "image" },
    { id: "scheduled", label: "Scheduled", href: "scheduled.html", icon: "clock" },
    { id: "customize", label: "Customize", href: "customize.html", icon: "target" },
    { id: "videos", label: "Videos", href: "images.html", icon: "video" }
  ],

  notebooks: {
    title: "Notebooks",
    items: [
      { label: "New notebook", href: "#", icon: "plus" },
      { label: "Launch notes", href: "#", icon: "note" }
    ]
  },

  history: {
    title: "All",
    items: [
      { label: "Poster concept for a launch", meta: "4d" },
      { label: "Habit tracker web app", meta: "4mo" },
      { label: "Weekly email summary", meta: "6mo" },
      { label: "Setting up a CLI tool", meta: "6mo" },
      { label: "Vibe coding an app", meta: "8mo" },
      { label: "RSI analysis walkthrough", meta: "1y" },
      { label: "Portrait retouch ideas", meta: "1y" }
    ]
  },

  topbar: { getApp: "Get app", upgrade: "Upgrade", temporary: "Turn on temporary chat" },

  home: {
    greeting: "Where should we start?",
    placeholder: "Type @ for connectors, skills and more",
    modes: ["Chat", "Task"],
    model: "Flash-Lite",
    suggestions: [
      { label: "Design a poster based on my taste", icon: "sparkles" },
      { label: "Check fall home maintenance tasks", icon: "corner" },
      { label: "Quiz me on film and cinema", icon: "film" }
    ]
  },

  composer: {
    ask: "Ask Gemini",
    tools: [
      { label: "Upload files", icon: "paperclip" },
      { label: "Add from Drive", icon: "drive" },
      { label: "More uploads", icon: "dots", submenu: true },
      { divider: true },
      { label: "Create image", icon: "image" },
      { label: "Create video", icon: "video", locked: true },
      { label: "Create music", icon: "music" },
      { label: "Canvas", icon: "canvas" },
      { label: "More tools", icon: "dots", submenu: true }
    ],
    models: [
      { label: "Auto", hint: "Adapts to your needs", icon: "check", active: true },
      { label: "Code & analysis", hint: "For code and data", icon: "bulb" },
      { label: "Thinking level", submenu: true }
    ]
  },

  chat: {
    title: "Conversation with Gemini",
    model: "Flash-Lite",
    turns: [
      {
        role: "user",
        label: "You said",
        text: "hello"
      },
      {
        role: "model",
        text: "Hi Alex — good to see you. I can help you write, plan, code or dig through a document. What are we working on today?",
        actions: ["Copy", "Good response", "Bad response", "Share", "More options"]
      }
    ],
    legal: "Gemini is AI and can make mistakes."
  },

  images: {
    heading: "Create images",
    sub: "Try a template or describe an idea in chat. Create with Nano Banana.",
    templates: ["Claw", "Neon", "Chibi", "Mug", "Headshot", "More"],
    model: "Flash-Lite",
    prompt: "Describe the image you want",
    aspect: "Aspect ratio",
    chips: ["1:1", "3:4", "4:3", "16:9"]
  },

  library: {
    heading: "Library",
    sections: [
      {
        title: "Documents",
        items: [
          { name: "Landing page copy", kind: "code", meta: "Feb 28, 12:46 PM" },
          { name: "../app/routes.tsx", kind: "code", meta: "Feb 28, 12:43 PM" },
          { name: "Design tokens", kind: "code", meta: "Feb 28, 12:43 PM" }
        ]
      },
      { title: "Media", items: [] }
    ]
  },

  scheduled: {
    badge: "BETA",
    heading: "Scheduled",
    intro: "Let Gemini handle routines, track updates, and take action for you.",
    learnMore: "Learn more",
    filter: "All",
    suggestedTitle: "Suggested",
    suggested: [
      { title: "Create a news digest", body: "Get a daily deep dive on any topic I'm curious about." },
      { title: "Build a study quiz", body: "Test my knowledge daily with questions on subjects I'm learning." },
      { title: "Track financial trends", body: "Summarize weekly market trends and news in sectors I follow." },
      { title: "Create a meal plan", body: "Set up a weekly meal plan and grocery list for my household." },
      { title: "Build a competitor digest", body: "Curate a weekly digest of what competitors ship." }
    ]
  },

  customize: {
    tabs: ["Discover", "Connectors", "Skills"],
    heading: "Customize Gemini",
    sub: "Add apps and skills so Gemini can work smarter for you",
    groups: [
      {
        title: "Everyday tools",
        cards: [
          { name: "Drive files", body: "Search and summarize files in a connected drive." },
          { name: "Focus your energy", body: "Align your workload with your energy instead of your calendar." },
          { name: "Generate fresh ideas", body: "Turn existing content into five entirely new creative concepts." },
          { name: "Get more perspectives", body: "Get three to five distinct takes on the same question." }
        ]
      },
      {
        title: "Business essentials",
        cards: [
          { name: "Meeting notes", body: "Summarize a transcript into decisions and owners." },
          { name: "Inbox triage", body: "Sort the day's mail into what needs a reply and what doesn't." }
        ]
      }
    ]
  },

  search: {
    placeholder: "Search chats",
    heading: "Where should we start?",
    recentsTitle: "Recents"
  },

  settings: {
    sections: [
      { label: "Activity", icon: "chart" },
      { label: "Personal Intelligence", icon: "bulb" },
      { label: "Import memory to Gemini", icon: "upload" },
      { label: "Avatar", icon: "user" },
      { label: "Usage limits", icon: "gauge" },
      { label: "Skills", icon: "target" },
      { label: "Cart and orders", icon: "cart" },
      { label: "Gems", icon: "gem" },
      { label: "Your public links", icon: "link" },
      { label: "Theme", icon: "moon" },
      { label: "Upgrade to Google AI Plus", icon: "star", accent: true },
      { label: "Task settings", icon: "check" },
      { label: "Browser", icon: "window" },
      { label: "Channels", icon: "rss" }
    ],
    footer: [
      { label: "Send feedback", icon: "feedback" },
      { label: "Help", icon: "help" }
    ],
    location: "From your IP address"
  }
};
