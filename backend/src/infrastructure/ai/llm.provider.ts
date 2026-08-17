export interface RoadmapGenerationPrompt {
  goalTitle: string;
  skillName: string;
  description?: string;
  targetOutcome?: string;
  skillLevel?: string;
}

export interface GeneratedMilestoneDraft {
  title: string;
  description: string;
  order: number;
}

export interface GeneratedRoadmapDraft {
  title: string;
  description: string;
  milestones: GeneratedMilestoneDraft[];
}

export interface CandidateForAi {
  id: string;
  name: string;
  country?: string | null;
  bio?: string | null;
  teachSkills: string[];
  learnSkills: string[];
}

export interface AiPartnerRecommendationPrompt {
  user: {
    name: string;
    bio?: string | null;
    teachSkills: string[];
    learnSkills: string[];
  };
  candidates: CandidateForAi[];
}

export interface AiPartnerRecommendation {
  candidateId: string;
  aiMatchScore: number;
  reasoning: string;
  suggestedProjectIdea: string;
}

export interface LLMProvider {
  generateRoadmapDraft(prompt: RoadmapGenerationPrompt): Promise<GeneratedRoadmapDraft>;
  recommendPartners(prompt: AiPartnerRecommendationPrompt): Promise<AiPartnerRecommendation[]>;
  generateAudioTopic(skillDomain: string): Promise<string>;
}
