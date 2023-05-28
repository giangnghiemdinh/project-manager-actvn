export interface ProjectStatisticalPayload {
    semesterId?: number;
    departmentId?: number;
}

export interface ProjectStatisticalResponse {
    total?: number;
    totalRefuse?: number;
    totalExpired?: number;
    totalCompleted?: number;
    totalReview?: number;
    totalPresentation?: number;
    averageScore?: number;
    scoreDistribution?: { [key: number]: number };
    outpoint?: { [key: string]: number };
}
