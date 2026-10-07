import { listBoardsSummaryUseCase } from '@/infrastructure/container';
import { ProjectHubView } from '@/components/projects/project-hub-view';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const metadata = {
  title: 'Hub de Projetos — Trello AI',
  description: 'Gestão visual de múltiplos projetos, quadros Kanban e IA com documentação .md.',
};

export default async function HomePage() {
  const projects = await listBoardsSummaryUseCase.execute();

  return <ProjectHubView initialProjects={projects} />;
}
