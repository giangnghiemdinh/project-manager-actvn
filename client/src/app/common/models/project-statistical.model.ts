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
    presentationPointGrade?: PointGrade;
    instructorPointGrade?: PointGrade;
    reviewerPointGrade?: PointGrade;
}

export interface PointGrade {
    'F'?: number;
    'D'?: number;
    'D+'?: number;
    'C'?: number;
    'C+'?: number;
    'B'?: number;
    'B+'?: number;
    'A'?: number;
    'A+'?: number;
}
