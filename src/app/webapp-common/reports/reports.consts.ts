import {Project} from '~/business-logic/model/projects/project';
import {User} from '~/business-logic/model/users/user';
import {Report} from '~/business-logic/model/reports/report';
import {
  GetCurrentUserResponseUserObjectCompany
} from '~/business-logic/model/users/getCurrentUserResponseUserObjectCompany';

export const PAGE_SIZE = 12;

export interface IReport extends Omit<Report, 'user'|'project'|'company'> {
  user?: User;
  company?: GetCurrentUserResponseUserObjectCompany;
  project?: Project;
}
