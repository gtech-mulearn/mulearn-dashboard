/**
 * PathFinder Questions Data
 *
 * 📍 src/features/onboarding/data/questions.ts
 *
 * Questions for the PathFinder quiz to recommend pathways.
 */

export interface QuestionOption {
  text: string;
  category: "coder" | "maker" | "manager" | "creative";
  highlight: string;
}

export interface Question {
  question: string;
  options: QuestionOption[];
}

export const pathfinderQuestions: Question[] = [
  {
    question: "What kind of activities do you enjoy the most?",
    options: [
      {
        text: "Building or crafting physical projects and experimenting with new materials.",
        category: "maker",
        highlight: "Build solutions that change the world",
      },
      {
        text: "Coding and creating software solutions or working with technology.",
        category: "coder",
        highlight: "Create apps used by millions",
      },
      {
        text: "Designing visual elements, user interfaces, or developing creative content.",
        category: "creative",
        highlight: "Design visuals that inspire millions",
      },
      {
        text: "Managing projects, understanding market needs, or exploring new knowledge areas.",
        category: "manager",
        highlight: "Lead teams to global success",
      },
    ],
  },
  {
    question: "Which skills do you want to develop?",
    options: [
      {
        text: "Robotics, 3D printing, or IoT-based projects.",
        category: "maker",
        highlight: "Build solutions that change the world",
      },
      {
        text: "Programming, debugging, or developing new applications.",
        category: "coder",
        highlight: "Create apps used by millions",
      },
      {
        text: "Visual communication, UX/UI design, or multimedia creation.",
        category: "creative",
        highlight: "Design visuals that inspire millions",
      },
      {
        text: "Leadership, marketing, research, or analysis skills.",
        category: "manager",
        highlight: "Lead teams to global success",
      },
    ],
  },
  {
    question: "How do you approach problem-solving?",
    options: [
      {
        text: "By physically experimenting, creating prototypes, and testing.",
        category: "maker",
        highlight: "Build solutions that change the world",
      },
      {
        text: "By writing code, creating logical solutions, and troubleshooting.",
        category: "coder",
        highlight: "Create apps used by millions",
      },
      {
        text: "By brainstorming creative approaches and sketching visual solutions.",
        category: "creative",
        highlight: "Design visuals that inspire millions",
      },
      {
        text: "By analyzing holistically, researching, and planning strategically.",
        category: "manager",
        highlight: "Lead teams to global success",
      },
    ],
  },
  {
    question: "Which tools or resources interest you most?",
    options: [
      {
        text: "Electronic components, fabrication tools, robotics kits.",
        category: "maker",
        highlight: "Build solutions that change the world",
      },
      {
        text: "Programming languages, development frameworks, software tools.",
        category: "coder",
        highlight: "Create apps used by millions",
      },
      {
        text: "Graphic design tools, wireframing software, creative suites.",
        category: "creative",
        highlight: "Design visuals that inspire millions",
      },
      {
        text: "Business models, research papers, management tools.",
        category: "manager",
        highlight: "Lead teams to global success",
      },
    ],
  },
  {
    question: "What kind of project excites you the most?",
    options: [
      {
        text: "Creating a new physical device or automated system.",
        category: "maker",
        highlight: "Build solutions that change the world",
      },
      {
        text: "Developing an app or building a machine learning model.",
        category: "coder",
        highlight: "Create apps used by millions",
      },
      {
        text: "Designing a logo or improving a website's user experience.",
        category: "creative",
        highlight: "Design visuals that inspire millions",
      },
      {
        text: "Organizing an event or developing a new business idea.",
        category: "manager",
        highlight: "Lead teams to global success",
      },
    ],
  },
];

export const pathwayInfo = {
  coder: {
    title: "Coder",
    includes: [
      "Programming Languages",
      "Web Development",
      "Mobile App Development",
      "Software Engineering",
      "Database Management",
      "Cloud Computing",
      "DevOps & CI/CD",
      "System Architecture",
    ],
  },
  maker: {
    title: "Maker",
    includes: [
      "Hardware Design",
      "Electronics",
      "3D Printing",
      "Robotics",
      "IoT Development",
      "Prototyping",
      "CAD/CAM",
      "Product Design",
    ],
  },
  manager: {
    title: "Manager",
    includes: [
      "Project Management",
      "Team Leadership",
      "Business Strategy",
      "Resource Planning",
      "Risk Management",
      "Agile Methodologies",
      "Stakeholder Management",
      "Process Optimization",
    ],
  },
  creative: {
    title: "Creative",
    includes: [
      "UI/UX Design",
      "Graphic Design",
      "Digital Marketing",
      "Content Creation",
      "Brand Strategy",
      "Animation",
      "Video Production",
      "Social Media Management",
    ],
  },
};

export const endgoalOptions = [
  { title: "Job", value: "job" },
  { title: "Research & Development", value: "r&d" },
  { title: "Entrepreneurship", value: "entrepreneurship" },
  { title: "Gig Works", value: "gig_work" },
  { title: "Higher Education", value: "higher_education" },
  { title: "Social Impact", value: "social_impact" },
];
