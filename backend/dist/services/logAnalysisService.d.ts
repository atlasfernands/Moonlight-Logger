import { AnalysisConfig } from '../config/analysis';
export interface LogAnalysis {
    classification: string;
    explanation: string;
    suggestion: string;
    confidence: number;
    source: 'heuristic' | 'ai' | 'hybrid';
    tags: string[];
    processingTime: number;
}
export declare class LogAnalysisService {
    private config;
    private aiProvider?;
    private analysisCache;
    constructor();
    private initializeAIProvider;
    private setupOpenAI;
    private setupAnthropic;
    private setupLocalAI;
    analyzeLog(logId: string, message: string, context: any): Promise<LogAnalysis>;
    private analyzeWithHeuristics;
    private analyzeWithAI;
    private analyzeHybrid;
    private updateLogWithAnalysis;
    getConfig(): AnalysisConfig;
    updateConfig(newConfig: Partial<AnalysisConfig>): void;
    clearCache(): void;
    getCacheStats(): {
        size: number;
        hitRate: number;
    };
}
//# sourceMappingURL=logAnalysisService.d.ts.map