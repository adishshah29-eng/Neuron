// Demo response data for the Sharper Sense chatbot frontend
// Backend API wiring will replace this in the next phase

const QUICK_PROMPTS = [
  "What is Sharper Sense?",
  "Is it safe to use?",
  "How do I sign up?",
];

const RESPONSES = [
  {
    keywords: ["what is", "tell me about", "explain", "sharper sense", "product"],
    response:
      "Sharper Sense is a pioneering neuromodulation company developing single-use neurostimulation patches worn on the neck. They enhance cognition, focus, and sensory processing — completely hands-free, maintenance-free, and safe. Think of it as a performance upgrade for your nervous system.",
  },
  {
    keywords: ["how does", "how it works", "technology", "patch", "work"],
    response:
      "The Sharper Sense patch delivers a gentle electric field that noninvasively stimulates nerves in your neck. These nerves project directly to the brain and primarily trigger the release of norepinephrine — a neurotransmitter that sharpens cognition and sensory awareness. No needles, no surgery, no side effects.",
  },
  {
    keywords: ["safe", "safety", "risk", "side effect", "fda", "approved"],
    response:
      "Safety is our top priority. The patch is non-invasive, single-use, and designed for general wellness. It undergoes rigorous testing before any release. It is not a medical device and is not intended to diagnose or treat any condition — it's built to help you perform at your best, naturally.",
  },
  {
    keywords: ["science", "research", "clinical", "norepinephrine", "nerve", "brain"],
    response:
      "The science is rooted in decades of neuroscience research. Transcutaneous vagus nerve stimulation (tVNS) is a well-studied method for modulating neurotransmitter release. Sharper Sense has miniaturized and optimized this into a discreet wearable that delivers consistent, targeted stimulation where it matters most.",
  },
  {
    keywords: ["sign up", "waitlist", "early access", "join", "get", "buy", "order", "price", "cost"],
    response:
      "You can join the exclusive early access waitlist right on this page! Scroll down to the Early Access section or click 'Get Early Access' in the navigation. Early members get priority shipping, exclusive pricing discounts, and direct input on the feature roadmap.",
  },
  {
    keywords: ["who", "team", "founder", "company", "people"],
    response:
      "Sharper Sense is led by a world-class team of neuroscientists, engineers, and clinicians who share a passion for unlocking human potential. Their combined expertise spans neurology, biomedical engineering, and consumer hardware — making this the most credible team in the space.",
  },
  {
    keywords: ["military", "sport", "athlete", "first responder", "shift worker", "student", "use case"],
    response:
      "Sharper Sense is designed for anyone where clarity and focus matter most: military personnel, professional athletes, first responders, shift workers, students, and older adults. Fatigue and distraction impair sensory processing — and that's exactly what the patch addresses.",
  },
  {
    keywords: ["wear", "how long", "duration", "when", "usage"],
    response:
      "The patch is designed to be worn comfortably on the back of your neck during high-demand activities or when you need to be at your sharpest. It's single-use, discreet, and requires no setup — just apply and go.",
  },
];

const FALLBACK_RESPONSE =
  "That's a great question! Our team is working on expanding our knowledge base. In the meantime, I'd recommend joining the early access waitlist so we can keep you updated as we launch. Is there anything else I can help with?";

export function getBotResponse(userMessage) {
  const lower = userMessage.toLowerCase();

  for (const item of RESPONSES) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item.response;
    }
  }

  return FALLBACK_RESPONSE;
}

export { QUICK_PROMPTS };
