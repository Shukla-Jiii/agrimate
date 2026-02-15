/* ─── Yield Optimizer Data Models ─── */

/** Risk severity level driving the recommendation color and urgency */
export type RiskLevel = "critical" | "warning" | "optimal" | "neutral";

/** Action type the AI recommends */
export type ActionType = "HOLD" | "APPLY" | "DELAY" | "HARVEST" | "IRRIGATE";

/** A single environmental or economic metric */
export interface OptimizerMetric {
    label: string;
    value: number;
    unit: string;
    /** Ideal range for contextual color coding */
    idealMin?: number;
    idealMax?: number;
    /** Icon key for lucide-react */
    icon: string;
}

/** AI-generated actionable recommendation */
export interface AIRecommendation {
    action: ActionType;
    riskLevel: RiskLevel;
    headline: string;
    rationale: string;
    /** Projected financial impact: positive = gain, negative = loss */
    projectedImpact: number;
    /** Confidence score 0–100 */
    confidence: number;
}

/** Historical data point for the mini trend chart */
export interface TrendPoint {
    timestamp: string;
    value: number;
}

/** Full data payload for the YieldOptimizerCard */
export interface YieldOptimizerData {
    /** Current environmental and economic metrics */
    metrics: {
        soilMoisture: OptimizerMetric;
        rainProbability: OptimizerMetric;
        fertilizerPrice: OptimizerMetric;
        yieldProjection: OptimizerMetric;
    };
    /** AI-generated recommendation */
    recommendation: AIRecommendation;
    /** Optional 7-day yield trend */
    yieldTrend?: TrendPoint[];
    /** Data freshness */
    lastUpdated: string;
}


