import { Department } from './department.model';
import { Gender } from '../constants/user.constant';
import { Project } from './project.model';

export interface Student {
  id?:           number;
  createdAt?:    Date;
  updatedAt?:    Date;
  fullName?:     string;
  code?:         string;
  phone?:        string;
  email?:        string;
  birthday?:     Date;
  course?:       string;
  gender?:       Gender;
  departmentId?: number;
  department?:   Department;
  projects?:     Project[];
}
