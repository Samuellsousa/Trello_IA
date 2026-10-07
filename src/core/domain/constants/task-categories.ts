export interface TaskCategoryDef {
  id: string;
  name: string;
  normalized: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  activeBgColor: string;
  activeTextColor: string;
  iconName: 'FileText' | 'Layout' | 'Server' | 'Database' | 'Rocket' | 'Cpu' | 'CheckCircle' | 'Layers';
}

export const PREDEFINED_TASK_CATEGORIES: TaskCategoryDef[] = [
  {
    id: 'cat-doc',
    name: 'Documentação',
    normalized: 'documentacao',
    description: 'Especificações, README, requisitos e manuais',
    color: 'text-emerald-700 dark:text-emerald-300',
    bgColor: 'bg-emerald-50 dark:bg-[#0e2a20]',
    borderColor: 'border-emerald-200 dark:border-emerald-800/70',
    activeBgColor: 'bg-emerald-600',
    activeTextColor: 'text-white',
    iconName: 'FileText',
  },
  {
    id: 'cat-front',
    name: 'Front-end',
    normalized: 'front-end',
    description: 'Interface de usuário, telas, estilos e componentes',
    color: 'text-teal-700 dark:text-teal-300',
    bgColor: 'bg-teal-50 dark:bg-[#0d2a24]',
    borderColor: 'border-teal-200 dark:border-teal-800/70',
    activeBgColor: 'bg-teal-600',
    activeTextColor: 'text-white',
    iconName: 'Layout',
  },
  {
    id: 'cat-back',
    name: 'Back-end',
    normalized: 'back-end',
    description: 'Regras de negócio, endpoints, microsserviços e workers',
    color: 'text-cyan-700 dark:text-cyan-300',
    bgColor: 'bg-cyan-50 dark:bg-[#0c282c]',
    borderColor: 'border-cyan-200 dark:border-cyan-800/70',
    activeBgColor: 'bg-cyan-600',
    activeTextColor: 'text-white',
    iconName: 'Server',
  },
  {
    id: 'cat-db',
    name: 'Banco de Dados',
    normalized: 'banco-de-dados',
    description: 'Schemas, tabelas, migrações e consultas SQL/NoSQL',
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-50 dark:bg-[#2c220f]',
    borderColor: 'border-amber-200 dark:border-amber-800/70',
    activeBgColor: 'bg-amber-600',
    activeTextColor: 'text-white',
    iconName: 'Database',
  },
  {
    id: 'cat-deploy',
    name: 'Deploy',
    normalized: 'deploy',
    description: 'Publicação, pipelines CI/CD, ambientes e releases',
    color: 'text-emerald-800 dark:text-emerald-200',
    bgColor: 'bg-emerald-100/60 dark:bg-[#123326]',
    borderColor: 'border-emerald-300 dark:border-emerald-700/70',
    activeBgColor: 'bg-emerald-700',
    activeTextColor: 'text-white',
    iconName: 'Rocket',
  },
  {
    id: 'cat-devops',
    name: 'DevOps & Infra',
    normalized: 'devops',
    description: 'Docker, Kubernetes, monitoramento e servidores',
    color: 'text-slate-700 dark:text-slate-300',
    bgColor: 'bg-slate-100 dark:bg-[#18231e]',
    borderColor: 'border-slate-300 dark:border-slate-700/70',
    activeBgColor: 'bg-slate-700',
    activeTextColor: 'text-white',
    iconName: 'Cpu',
  },
  {
    id: 'cat-test',
    name: 'Testes / QA',
    normalized: 'testes',
    description: 'Testes unitários, de integração e validações',
    color: 'text-sky-700 dark:text-sky-300',
    bgColor: 'bg-sky-50 dark:bg-[#0e242c]',
    borderColor: 'border-sky-200 dark:border-sky-800/70',
    activeBgColor: 'bg-sky-600',
    activeTextColor: 'text-white',
    iconName: 'CheckCircle',
  },
  {
    id: 'cat-arch',
    name: 'Arquitetura',
    normalized: 'arquitetura',
    description: 'Design de sistemas, clean architecture e contratos',
    color: 'text-emerald-900 dark:text-emerald-100',
    bgColor: 'bg-emerald-100 dark:bg-[#16382a]',
    borderColor: 'border-emerald-400 dark:border-emerald-600/70',
    activeBgColor: 'bg-emerald-800',
    activeTextColor: 'text-white',
    iconName: 'Layers',
  },
];

export function findCategoryMeta(tagName: string) {
  const normalized = tagName.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  return PREDEFINED_TASK_CATEGORIES.find((cat) => {
    const catNorm = cat.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return catNorm === normalized || normalized.includes(cat.normalized.replace(/[^a-z0-9]/g, ''));
  });
}
