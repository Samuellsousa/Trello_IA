export type TechCategory = 
  | 'languages' 
  | 'frameworks' 
  | 'databases' 
  | 'devops' 
  | 'libraries' 
  | 'tools';

export interface TechItem {
  id: string;
  name: string;
  category: TechCategory;
  version?: string;
  confidence?: number;
  sourceDocId?: string;
}

export interface ProjectTechStack {
  languages: TechItem[];
  frameworks: TechItem[];
  databases: TechItem[];
  devops: TechItem[];
  libraries: TechItem[];
  tools: TechItem[];
}
