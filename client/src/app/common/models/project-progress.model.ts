import { ProjectProgressType } from '../constants';

export interface ProjectProgress {
    id?: number;
    createdAt?: Date;
    updatedAt?: Date;
    wordFile?: ReportFile;
    reportFile?: ReportFile;
    otherFile?: ReportFile;
    comment1?: string;
    comment2?: string;
    comment3?: string;
    comment4?: string;
    comment5?: string;
    score?: number;
    isApproval?: boolean;
    type?: ProjectProgressType;
    projectId?: number;
}

export interface ReportFile {
    id?: string;
    name?: string;
    webViewLink?: string;
    webContentLink?: string;
    originObject?: any;
}
