'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Question } from '@/lib/dynamodb';
import { QuestionType } from '@/types/enums';
import PageHeader from '@/components/PageHeader';
import { FormattedAnswer } from '@/components/FormattedAnswer';
import {
  StaticQuestionLoader,
  QuestionUtils,
  TechnicalQuestion,
} from '@/lib/data/questionLoader';
import {
  Code2,
  BookOpen,
  ExternalLink,
  Star,
  Clock,
  Filter,
  ChevronDown,
} from 'lucide-react';

// Suggested schemas for project examples and resources

interface ProjectExample {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  technologies: string[];
  githubUrl?: string;
  liveDemo?: string;
  features: string[];
  learningObjectives: string[];
  created_at: string;
  updated_at: string;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'documentation' | 'tutorial' | 'video' | 'book' | 'course' | 'tool';
  language: string;
  url: string;
  rating: number; // 1-5
  estimatedTime?: number; // in minutes for videos/courses
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  created_at: string;
  updated_at: string;
}

// Language/Framework configuration
interface TechnologyFilter {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

// Component that uses useSearchParams - must be wrapped in Suspense
function TechnicalPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Available technologies with question files
  const availableLanguages = ['python', 'react', 'nodejs', 'general'];

  // Get initial technology from URL or default to 'general'
  // Validate that the language has question files available
  const urlLanguage = searchParams.get('programming_language');
  const initialTechnology =
    urlLanguage && availableLanguages.includes(urlLanguage)
      ? urlLanguage
      : 'general';

  const [selectedTechnology, setSelectedTechnology] =
    useState<string>(initialTechnology);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [projectExamples, setProjectExamples] = useState<ProjectExample[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'questions' | 'projects' | 'resources'
  >('questions');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Function to update technology and URL
  const handleTechnologyChange = (techId: string) => {
    setSelectedTechnology(techId);
    // Update URL with the new programming_language parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('programming_language', techId);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    // Watch for changes in dark mode
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Add custom scrollbar hiding styles
  const scrollbarHideStyle = {
    scrollbarWidth: 'none' as const,
    msOverflowStyle: 'none' as const,
    WebkitScrollbar: {
      display: 'none',
    },
  };

  // Technology filters - only show technologies with available question files
  // Available question files: nodejs.json, python.json, react.json, general.json
  const technologies: TechnologyFilter[] = [
    {
      id: 'general',
      name: 'General',
      icon: '🎯',
      color: 'text-gray-600',
      bgColor: 'bg-gradient-to-br from-gray-50 via-gray-100 to-slate-100',
      borderColor: 'border-gray-200 hover:border-gray-300',
    },
    {
      id: 'python',
      name: 'Python',
      icon: '�',
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100',
      borderColor: 'border-blue-200 hover:border-blue-300',
    },
    {
      id: 'react',
      name: 'React',
      icon: '⚛️',
      color: 'text-cyan-600',
      bgColor: 'bg-gradient-to-br from-cyan-50 via-cyan-100 to-blue-100',
      borderColor: 'border-cyan-200 hover:border-cyan-300',
    },
    {
      id: 'nodejs',
      name: 'Node.js',
      icon: '🚀',
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 via-green-100 to-emerald-100',
      borderColor: 'border-green-200 hover:border-green-300',
    },
    // Commented out technologies without question files yet
    // {
    //   id: 'javascript',
    //   name: 'JavaScript',
    //   icon: '�',
    //   color: 'text-yellow-600',
    //   bgColor: 'bg-gradient-to-br from-yellow-50 via-yellow-100 to-orange-100',
    //   borderColor: 'border-yellow-200 hover:border-yellow-300',
    // },
    // {
    //   id: 'java',
    //   name: 'Java',
    //   icon: '☕',
    //   color: 'text-orange-600',
    //   bgColor: 'bg-gradient-to-br from-orange-50 via-orange-100 to-red-100',
    //   borderColor: 'border-orange-200 hover:border-orange-300',
    // },
    // {
    //   id: 'csharp',
    //   name: 'C#',
    //   icon: '🔷',
    //   color: 'text-purple-600',
    //   bgColor: 'bg-gradient-to-br from-purple-50 via-purple-100 to-violet-100',
    //   borderColor: 'border-purple-200 hover:border-purple-300',
    // },
    // {
    //   id: 'php',
    //   name: 'PHP',
    //   icon: '🐘',
    //   color: 'text-indigo-600',
    //   bgColor: 'bg-gradient-to-br from-indigo-50 via-indigo-100 to-blue-100',
    //   borderColor: 'border-indigo-200 hover:border-indigo-300',
    // },
    // {
    //   id: 'go',
    //   name: 'Go',
    //   icon: '🐹',
    //   color: 'text-teal-600',
    //   bgColor: 'bg-gradient-to-br from-teal-50 via-teal-100 to-cyan-100',
    //   borderColor: 'border-teal-200 hover:border-teal-300',
    // },
  ];

  // Mock data for projects and resources - will be replaced with API calls later
  const mockProjectExamples: Record<string, ProjectExample[]> = {
    javascript: [
      {
        id: '1',
        title: 'Todo App with Local Storage',
        description:
          'Build a todo application that persists data using browser local storage',
        language: 'javascript',
        difficulty: 'beginner',
        estimatedTime: 120,
        technologies: ['HTML', 'CSS', 'Vanilla JS', 'Local Storage'],
        githubUrl: 'https://github.com/example/todo-app',
        features: [
          'Add/remove todos',
          'Mark as complete',
          'Persistent storage',
          'Responsive design',
        ],
        learningObjectives: [
          'DOM manipulation',
          'Event handling',
          'Local storage API',
          'CSS Flexbox',
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Weather App with API Integration',
        description:
          'Create a weather application that fetches data from a weather API',
        language: 'javascript',
        difficulty: 'intermediate',
        estimatedTime: 180,
        technologies: ['JavaScript', 'Fetch API', 'CSS Grid', 'Weather API'],
        githubUrl: 'https://github.com/example/weather-app',
        liveDemo: 'https://weather-app-demo.com',
        features: [
          'Search by city',
          'Current weather',
          '5-day forecast',
          'Geolocation',
        ],
        learningObjectives: [
          'API integration',
          'Async/await',
          'Error handling',
          'Responsive design',
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    react: [
      {
        id: '3',
        title: 'E-commerce Dashboard',
        description:
          'Build a responsive e-commerce admin dashboard with charts and data tables',
        language: 'react',
        difficulty: 'advanced',
        estimatedTime: 480,
        technologies: [
          'React',
          'TypeScript',
          'Chart.js',
          'Tailwind CSS',
          'React Router',
        ],
        githubUrl: 'https://github.com/example/ecommerce-dashboard',
        features: [
          'Product management',
          'Sales analytics',
          'User management',
          'Dark mode',
        ],
        learningObjectives: [
          'Component composition',
          'State management',
          'TypeScript integration',
          'Data visualization',
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '4',
        title: 'Social Media Clone',
        description: 'Create a social media platform with real-time features',
        language: 'react',
        difficulty: 'advanced',
        estimatedTime: 600,
        technologies: [
          'React',
          'Redux',
          'Socket.io',
          'Material-UI',
          'Firebase',
        ],
        githubUrl: 'https://github.com/example/social-media-clone',
        features: [
          'Real-time chat',
          'Post creation',
          'Image upload',
          'User authentication',
        ],
        learningObjectives: [
          'Real-time communication',
          'State management',
          'File uploads',
          'Authentication',
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    python: [
      {
        id: '5',
        title: 'RESTful API with FastAPI',
        description:
          'Build a complete REST API with authentication, database, and documentation',
        language: 'python',
        difficulty: 'intermediate',
        estimatedTime: 300,
        technologies: ['FastAPI', 'SQLAlchemy', 'PostgreSQL', 'JWT', 'Docker'],
        githubUrl: 'https://github.com/example/fastapi-rest',
        features: [
          'CRUD operations',
          'JWT authentication',
          'Database migrations',
          'API documentation',
        ],
        learningObjectives: [
          'API design',
          'Database ORM',
          'Authentication',
          'Docker containerization',
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '6',
        title: 'Machine Learning Pipeline',
        description:
          'Create an end-to-end ML pipeline for data processing and model deployment',
        language: 'python',
        difficulty: 'advanced',
        estimatedTime: 420,
        technologies: ['Python', 'Pandas', 'Scikit-learn', 'Flask', 'Docker'],
        githubUrl: 'https://github.com/example/ml-pipeline',
        features: [
          'Data preprocessing',
          'Model training',
          'API endpoint',
          'Model monitoring',
        ],
        learningObjectives: [
          'Data science workflow',
          'ML model deployment',
          'API development',
          'Monitoring',
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    nodejs: [
      {
        id: '7',
        title: 'Real-time Chat Application',
        description:
          'Build a real-time chat app with multiple rooms and user authentication',
        language: 'nodejs',
        difficulty: 'intermediate',
        estimatedTime: 240,
        technologies: ['Node.js', 'Express', 'Socket.io', 'MongoDB', 'JWT'],
        githubUrl: 'https://github.com/example/chat-app',
        features: [
          'Real-time messaging',
          'Multiple rooms',
          'User authentication',
          'Message history',
        ],
        learningObjectives: [
          'WebSocket communication',
          'Real-time features',
          'Authentication',
          'Database design',
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    java: [
      {
        id: '8',
        title: 'Spring Boot Microservice',
        description:
          'Create a microservice architecture with Spring Boot and Docker',
        language: 'java',
        difficulty: 'advanced',
        estimatedTime: 360,
        technologies: [
          'Spring Boot',
          'Spring Security',
          'PostgreSQL',
          'Docker',
          'Kubernetes',
        ],
        githubUrl: 'https://github.com/example/spring-microservice',
        features: [
          'Microservice architecture',
          'Service discovery',
          'Load balancing',
          'Security',
        ],
        learningObjectives: [
          'Microservices design',
          'Container orchestration',
          'Security patterns',
          'Scalability',
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  };

  const mockResources: Record<string, Resource[]> = {
    javascript: [
      {
        id: '1',
        title: 'MDN JavaScript Guide',
        description:
          'Comprehensive guide to JavaScript fundamentals and advanced concepts',
        type: 'documentation',
        language: 'javascript',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
        rating: 5,
        level: 'beginner',
        tags: ['fundamentals', 'reference', 'official'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'JavaScript: The Good Parts',
        description:
          'Essential book covering JavaScript best practices and patterns',
        type: 'book',
        language: 'javascript',
        url: 'https://example.com/js-good-parts',
        rating: 4,
        level: 'intermediate',
        tags: ['best-practices', 'patterns', 'classic'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Modern JavaScript Course',
        description:
          'Complete course covering ES6+ features and modern development practices',
        type: 'course',
        language: 'javascript',
        url: 'https://example.com/modern-js-course',
        rating: 5,
        estimatedTime: 1200,
        level: 'intermediate',
        tags: ['es6', 'modern', 'comprehensive'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    react: [
      {
        id: '4',
        title: 'React Official Documentation',
        description:
          'Official React documentation with tutorials and API reference',
        type: 'documentation',
        language: 'react',
        url: 'https://react.dev',
        rating: 5,
        level: 'beginner',
        tags: ['official', 'tutorial', 'hooks'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '5',
        title: 'Advanced React Patterns',
        description:
          'Deep dive into advanced React patterns and performance optimization',
        type: 'tutorial',
        language: 'react',
        url: 'https://example.com/advanced-react',
        rating: 4,
        estimatedTime: 180,
        level: 'advanced',
        tags: ['patterns', 'performance', 'optimization'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    python: [
      {
        id: '6',
        title: 'Python Official Documentation',
        description:
          'Complete Python documentation with tutorials and library reference',
        type: 'documentation',
        language: 'python',
        url: 'https://docs.python.org/',
        rating: 5,
        level: 'beginner',
        tags: ['official', 'comprehensive', 'reference'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '7',
        title: 'Effective Python',
        description: 'Best practices for writing better Python code',
        type: 'book',
        language: 'python',
        url: 'https://example.com/effective-python',
        rating: 5,
        level: 'intermediate',
        tags: ['best-practices', 'idioms', 'performance'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  };

  // Load data based on selected technology
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        // Load static questions from JSON files
        const staticQuestions =
          await StaticQuestionLoader.loadTechnicalQuestions(selectedTechnology);
        setQuestions(staticQuestions);
      } catch (error) {
        console.error('Error loading questions:', error);
        setQuestions([]);
      }

      // Keep mock data for projects and resources for now
      setProjectExamples(mockProjectExamples[selectedTechnology] || []);
      setResources(mockResources[selectedTechnology] || []);
      setLoading(false);
    };

    loadQuestions();
  }, [selectedTechnology]);

  // Filter questions based on difficulty and search term
  useEffect(() => {
    let filtered = questions;

    // Apply difficulty filter
    filtered = QuestionUtils.filterByDifficulty(filtered, difficultyFilter);

    // Apply search filter
    filtered = QuestionUtils.searchQuestions(filtered, searchTerm);

    setFilteredQuestions(filtered);
  }, [questions, difficultyFilter, searchTerm]);

  const currentTech = technologies.find(
    (tech) => tech.id === selectedTechnology
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-2 sm:py-3">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <PageHeader
          title="Technical Prep"
          description={`Practice with ${
            currentTech?.name || 'programming'
          } questions, projects, and resources.`}
        />

        {/* Technology Filter */}
        <div className="mb-3 sm:mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Technology
              </h3>
              {currentTech && (
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                  {questions.length + projectExamples.length + resources.length}{' '}
                  items
                </span>
              )}
            </div>

            {/* Horizontal Scrollable Technology Selector */}
            <div className="relative">
              <div
                className="flex gap-2 overflow-x-auto pb-2 -mb-2"
                style={scrollbarHideStyle}
              >
                {technologies.map((tech) => (
                  <button
                    key={tech.id}
                    onClick={() => handleTechnologyChange(tech.id)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 
                      text-sm font-medium whitespace-nowrap flex-shrink-0 min-w-fit
                      ${
                        selectedTechnology === tech.id
                          ? `${tech.borderColor.replace('hover:', '')} ${
                              tech.bgColor
                            } ${tech.color}`
                          : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    <span className="text-base leading-none">{tech.icon}</span>
                    <span className="text-xs sm:text-sm">{tech.name}</span>
                  </button>
                ))}
              </div>

              {/* Scroll indicators */}
              <div className="absolute right-0 top-0 bottom-2 w-6 bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none opacity-50"></div>
            </div>
          </div>
        </div>

        {/* Filters for Questions (only show when questions tab is active) */}
        {activeTab === 'questions' && (
          <div className="mb-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-200 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
                           placeholder-gray-500 dark:placeholder-gray-400"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="sm:w-48">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              {filteredQuestions.length} of {questions.length} questions
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-3 sm:mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {[
                {
                  id: 'questions',
                  label: 'Questions',
                  count: filteredQuestions.length,
                  icon: '❓',
                },
                {
                  id: 'projects',
                  label: 'Projects',
                  count: projectExamples.length,
                  icon: '🛠️',
                },
                {
                  id: 'resources',
                  label: 'Resources',
                  count: resources.length,
                  icon: '📚',
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 px-2 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-all duration-200
                    ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  <span className="text-sm sm:hidden">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.count}</span>
                  <span className="hidden sm:inline">({tab.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Loading {currentTech?.name}...
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {/* Questions Tab */}
            {activeTab === 'questions' && (
              <div className="space-y-3 sm:space-y-4">
                {filteredQuestions.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No questions found
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
                      {questions.length === 0
                        ? `No questions available for ${currentTech?.name} yet.`
                        : 'No questions match your current filters.'}
                    </p>
                  </div>
                ) : (
                  filteredQuestions.map((question) => {
                    const techQuestion = question as TechnicalQuestion;
                    return (
                      <div
                        key={question.id}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="space-y-2 mb-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white leading-tight flex-1">
                              {question.question}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Difficulty Badge */}
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap ${
                                techQuestion.difficulty === 'beginner'
                                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                  : techQuestion.difficulty === 'intermediate'
                                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                              }`}
                            >
                              {techQuestion.difficulty || 'intermediate'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium ${currentTech?.color} bg-gray-50 dark:bg-gray-700 whitespace-nowrap`}
                            >
                              {currentTech?.name}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            {question.context}
                          </p>
                        </div>

                        <details className="group">
                          <summary className="cursor-pointer text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">
                            Show Answer
                            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 transform group-open:rotate-180 transition-transform" />
                          </summary>
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <FormattedAnswer
                              answer={question.answer}
                              isDarkMode={isDarkMode}
                            />
                          </div>
                        </details>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                {projectExamples.length === 0 ? (
                  <div className="sm:col-span-full text-center py-8 sm:py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <Code2 className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No projects found
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
                      No project examples available for {currentTech?.name} yet.
                    </p>
                  </div>
                ) : (
                  projectExamples.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="space-y-2 mb-3">
                        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                          {project.title}
                        </h3>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium whitespace-nowrap ${
                            project.difficulty === 'beginner'
                              ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                              : project.difficulty === 'intermediate'
                              ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                              : 'text-red-600 bg-red-50 dark:bg-red-900/20'
                          }`}
                        >
                          {project.difficulty}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                        {project.description}
                      </p>

                      <div className="flex items-center gap-3 mb-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>
                            {Math.floor(project.estimatedTime / 60)}h{' '}
                            {project.estimatedTime % 60}m
                          </span>
                        </div>
                      </div>

                      <div className="mb-3 sm:mb-4">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Technologies:
                        </h4>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {project.technologies.slice(0, 4).map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 4 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md text-xs">
                              +{project.technologies.length - 4}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg text-xs sm:text-sm hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                            GitHub
                          </a>
                        )}
                        {project.liveDemo && (
                          <a
                            href={project.liveDemo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg text-xs sm:text-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                            Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="space-y-3 sm:space-y-4">
                {resources.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No resources found
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
                      No resources available for {currentTech?.name} yet.
                    </p>
                  </div>
                ) : (
                  resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white leading-tight mb-2">
                            {resource.title}
                          </h3>
                          <div className="flex items-center flex-wrap gap-2 mb-2">
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-medium ${
                                resource.type === 'documentation'
                                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                  : resource.type === 'tutorial'
                                  ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                                  : resource.type === 'video'
                                  ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                  : resource.type === 'book'
                                  ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
                                  : resource.type === 'course'
                                  ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                                  : 'text-gray-600 bg-gray-50 dark:bg-gray-700'
                              }`}
                            >
                              {resource.type}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-medium ${
                                resource.level === 'beginner'
                                  ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                                  : resource.level === 'intermediate'
                                  ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                                  : 'text-red-600 bg-red-50 dark:bg-red-900/20'
                              }`}
                            >
                              {resource.level}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                i < resource.rating
                                  ? 'text-yellow-500 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 leading-relaxed">
                        {resource.description}
                      </p>

                      <div className="mb-3 sm:mb-4">
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {resource.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                          {resource.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md text-xs">
                              +{resource.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 px-3 sm:px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg text-xs sm:text-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors w-full sm:w-auto"
                      >
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                        Visit Resource
                      </a>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function TechnicalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-2 sm:py-3">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="text-center py-8 sm:py-12">
              <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Loading...
              </p>
            </div>
          </div>
        </div>
      }
    >
      <TechnicalPageContent />
    </Suspense>
  );
}
