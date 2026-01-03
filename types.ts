
export interface ContentRow {
  url: string;
  headline: string;
  totalUsers: number;
}

export interface ThemePerformance {
  theme: string;
  storyCount: number;
  totalUsers: number;
  usersPerStory: number;
}

export interface ThemeKeywords {
  theme: string;
  topKeywords: string[];
  topEntities: string[];
}

export interface KeywordPerformance {
  keyword: string;
  storyCount: number;
  totalUsers: number;
  usersPerStory: number;
}

export interface StylePerformance {
  style: string;
  avgUsersPerStory: number;
  notes: string;
}

export interface EditorialRecommendations {
  increase: string[];
  optimize: string[];
  decrease: string[];
  experiment: string[];
}

export interface PerformanceExtreme {
  theme: string;
  metric: string;
  value: number;
  explanation: string;
  count: number;
  totalReach: number;
}

export interface AnalysisResult {
  totalRecordsAnalyzed: number;
  themes: ThemePerformance[];
  keywords: ThemeKeywords[];
  keywordPerformance: KeywordPerformance[];
  styles: StylePerformance[];
  recommendations: EditorialRecommendations;
  insights: string[];
  topPerformer: PerformanceExtreme;
  bottomPerformer: PerformanceExtreme;
}
