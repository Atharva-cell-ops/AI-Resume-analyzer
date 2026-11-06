export interface SkillSynonymGroup {
  canonical: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'cloud' | 'mobile' | 'ai_ml' | 'testing' | 'practices';
  synonyms: string[];
}

export const TECH_SKILL_SYNONYMS: SkillSynonymGroup[] = [
  // Frontend
  { canonical: 'JavaScript', category: 'frontend', synonyms: ['js', 'es6', 'es2020', 'vanilla javascript'] },
  { canonical: 'TypeScript', category: 'frontend', synonyms: ['ts'] },
  { canonical: 'React', category: 'frontend', synonyms: ['reactjs', 'react.js'] },
  { canonical: 'Next.js', category: 'frontend', synonyms: ['nextjs', 'next'] },
  { canonical: 'Vue.js', category: 'frontend', synonyms: ['vue', 'vuejs'] },
  { canonical: 'Angular', category: 'frontend', synonyms: ['angularjs', 'angular.io'] },
  { canonical: 'Tailwind CSS', category: 'frontend', synonyms: ['tailwind', 'tailwindcss'] },
  { canonical: 'HTML5', category: 'frontend', synonyms: ['html'] },
  { canonical: 'CSS3', category: 'frontend', synonyms: ['css'] },
  { canonical: 'Redux', category: 'frontend', synonyms: ['redux toolkit', 'rtk'] },

  // Backend
  { canonical: 'Node.js', category: 'backend', synonyms: ['node', 'nodejs'] },
  { canonical: 'Express.js', category: 'backend', synonyms: ['express', 'expressjs'] },
  { canonical: 'Python', category: 'backend', synonyms: ['python3', 'py'] },
  { canonical: 'FastAPI', category: 'backend', synonyms: ['fast api'] },
  { canonical: 'Django', category: 'backend', synonyms: [] },
  { canonical: 'Flask', category: 'backend', synonyms: [] },
  { canonical: 'Java', category: 'backend', synonyms: ['core java'] },
  { canonical: 'Spring Boot', category: 'backend', synonyms: ['spring', 'springboot'] },
  { canonical: 'Go', category: 'backend', synonyms: ['golang'] },
  { canonical: 'Rust', category: 'backend', synonyms: [] },
  { canonical: 'C#', category: 'backend', synonyms: ['csharp', '.net', 'dotnet', 'asp.net'] },
  { canonical: 'C++', category: 'backend', synonyms: ['cpp'] },
  { canonical: 'GraphQL', category: 'backend', synonyms: ['gql'] },
  { canonical: 'REST API', category: 'backend', synonyms: ['restful', 'rest', 'rest apis'] },

  // Databases
  { canonical: 'PostgreSQL', category: 'database', synonyms: ['postgres', 'pgsql', 'psql'] },
  { canonical: 'MySQL', category: 'database', synonyms: [] },
  { canonical: 'MongoDB', category: 'database', synonyms: ['mongo'] },
  { canonical: 'Redis', category: 'database', synonyms: [] },
  { canonical: 'Prisma ORM', category: 'database', synonyms: ['prisma'] },
  { canonical: 'Elasticsearch', category: 'database', synonyms: ['elastic search'] },
  { canonical: 'SQL', category: 'database', synonyms: ['relational database', 'rdbms'] },

  // DevOps & Cloud
  { canonical: 'Docker', category: 'devops', synonyms: ['containerization', 'containers'] },
  { canonical: 'Kubernetes', category: 'devops', synonyms: ['k8s'] },
  { canonical: 'CI/CD', category: 'devops', synonyms: ['continuous integration', 'continuous delivery', 'github actions', 'jenkins', 'gitlab ci'] },
  { canonical: 'AWS', category: 'cloud', synonyms: ['amazon web services', 'ec2', 's3', 'lambda'] },
  { canonical: 'Google Cloud Platform', category: 'cloud', synonyms: ['gcp', 'google cloud'] },
  { canonical: 'Azure', category: 'cloud', synonyms: ['microsoft azure'] },
  { canonical: 'Terraform', category: 'devops', synonyms: ['infrastructure as code', 'iac'] },
  { canonical: 'Linux', category: 'devops', synonyms: ['bash', 'shell scripting', 'unix'] },
  { canonical: 'Git', category: 'devops', synonyms: ['github', 'gitlab', 'version control'] },

  // Testing
  { canonical: 'Unit Testing', category: 'testing', synonyms: ['jest', 'vitest', 'mocha', 'chai'] },
  { canonical: 'End-to-End Testing', category: 'testing', synonyms: ['e2e', 'playwright', 'cypress', 'selenium'] },

  // Practices
  { canonical: 'Agile', category: 'practices', synonyms: ['scrum', 'kanban', 'sprints', 'jira'] },
  { canonical: 'Microservices', category: 'practices', synonyms: ['microservice architecture', 'distributed systems'] }
];

export const CANONICAL_SKILL_LOOKUP: Map<string, string> = new Map();
TECH_SKILL_SYNONYMS.forEach(item => {
  CANONICAL_SKILL_LOOKUP.set(item.canonical.toLowerCase(), item.canonical);
  item.synonyms.forEach(syn => {
    CANONICAL_SKILL_LOOKUP.set(syn.toLowerCase(), item.canonical);
  });
});

