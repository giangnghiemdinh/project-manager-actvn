import { Department } from './department.model';
import { Project } from './project.model';
import { User } from './user.model';
import { ExaminerCouncilPosition } from '../constants';
import { Semester } from './semester.model';

export interface ExaminerCouncil {
    id?: number;
    createdAt?: Date;
    updatedAt?: Date;
    location?: string;
    semesterId?: number;
    semester?: Semester;
    departmentId?: number;
    department?: Department;
    projects?: Project[];
    users?: ExaminerCouncilUser[];
}

export interface ExaminerCouncilUser {
    id?: number | string;
    createdAt?: Date;
    updatedAt?: Date;
    user?: User;
    userId?: number;
    position?: ExaminerCouncilPosition;
}
