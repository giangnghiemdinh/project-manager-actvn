import { Department } from './department.model';
import { Project } from './project.model';
import { User } from './user.model';
import { Semester } from './semester.model';

export interface ManagerStaff {
    id?: number;
    createdAt?: Date;
    updatedAt?: Date;
    semester?: Semester;
    semesterId?: number;
    departmentId?: number;
    department?: Department;
    projects?: Project[];
    user?: User;
    userId?: number;
}
