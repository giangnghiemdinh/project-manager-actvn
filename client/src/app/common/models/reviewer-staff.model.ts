import { Department } from './department.model';
import { Project } from './project.model';
import { User } from './user.model';
import { Semester } from './semester.model';

export interface ReviewerStaff {
    id?:           number;
    createdAt?:    Date;
    updatedAt?:    Date;
    semesterId?:     number;
    semester?: Semester;
    departmentId?: number;
    department?:   Department;
    projects?:     Project[];
    user?:        User;
    userId?:      number;
}
