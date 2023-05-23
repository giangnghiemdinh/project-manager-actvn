import { Department } from './department.model';
import { Semester } from './semester.model';

export interface Progress {
  id?:             number;
  semesterId?:     number;
  semester?:       Semester;
  departmentId?:   number;
  department?:     Department;
  proposeStart?:   Date;
  proposeEnd?:     Date;
  reportStart?:    Date;
  reportEnd?:      Date;
  report1Start?:   Date;
  report1End?:     Date;
  report2Start?:   Date;
  report2End?:     Date;
  report3Start?:   Date;
  report3End?:     Date;
  report4Start?:   Date;
  report4End?:     Date;
  instrCmtStart?:  Date;
  instrCmtEnd?:    Date;
  rvrCmtStart?:    Date;
  rvrCmtEnd?:      Date;
  presentStart?:   Date;
  presentEnd?:     Date;
  completedStart?: Date;
  completedEnd?:   Date;
}
