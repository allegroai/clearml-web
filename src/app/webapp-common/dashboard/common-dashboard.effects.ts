import {Injectable} from '@angular/core';
import {ApiProjectsService} from '../../business-logic/api-services/projects.service';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {requestFailed} from '../core/actions/http.actions';
import {activeLoader, addMessage, deactivateLoader} from '../core/actions/layout.actions';
import {CreateProjectFromDashboard, getInviteInfo, GetRecentProjects, setInviteInfo, SetRecentProjects, SetRecentTasks} from './common-dashboard.actions';
import {CARDS_IN_ROW, DASHBOARD_ACTIONS} from './common-dashboard.const';
import {MESSAGES_SEVERITY} from '../../app.constants';
import {ApiTasksService} from '../../business-logic/api-services/tasks.service';
import {IRecentTask} from './common-dashboard.reducer';
import {ProjectsGetAllExRequest} from '../../business-logic/model/projects/projectsGetAllExRequest';
import {catchError, mergeMap, map, switchMap, withLatestFrom} from 'rxjs/operators';
import {ApiLoginService} from '../../business-logic/api-services/login.service';
import {addWorkspace, setWorkspace} from '../core/actions/users.actions';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {Store} from '@ngrx/store';
import {ErrorService} from '../shared/services/error.service';
import {selectCurrentUser, selectShowOnlyUserWork} from '../core/reducers/users-reducer';

@Injectable()
export class CommonDashboardEffects {
  constructor(private actions: Actions, private projectsApi: ApiProjectsService,
              private tasksApi: ApiTasksService, private loginApi: ApiLoginService,
              private errorService: ErrorService, private store: Store<any>,
              private dialog: MatDialog) {
  }

  activeLoader = createEffect(() => this.actions.pipe(
    ofType(DASHBOARD_ACTIONS.GET_RECENT_PROJECTS, DASHBOARD_ACTIONS.GET_RECENT_PROJECTS, DASHBOARD_ACTIONS.GET_RECENT_TASKS, DASHBOARD_ACTIONS.CREATE_PROJECT),
    map(action => activeLoader(action.type))
  ));

  getRecentProjects = createEffect(() => this.actions.pipe(
    ofType<GetRecentProjects>(DASHBOARD_ACTIONS.GET_RECENT_PROJECTS),
    withLatestFrom(this.store.select(selectCurrentUser), this.store.select(selectShowOnlyUserWork)),
    mergeMap(([action, user, showOnlyUserWork]) =>
      this.projectsApi.projectsGetAllEx({
        ...action.payload.getAllFilter,
        active_users: (showOnlyUserWork ? [user.id] : null),
        only_fields: ['name', 'company', 'user', 'created', 'default_output_destination']
      }).pipe(
          mergeMap(res => [new SetRecentProjects(res.projects), deactivateLoader(action.type)]),
          catchError(error => [deactivateLoader(action.type), requestFailed(error)])
        )
    )
  ));

  getRecentTasks = createEffect(() => this.actions.pipe(
    ofType(DASHBOARD_ACTIONS.GET_RECENT_TASKS ),
    withLatestFrom(this.store.select(selectCurrentUser), this.store.select(selectShowOnlyUserWork)),
    switchMap(([action, user, showOnlyUserWork]) => this.tasksApi.tasksGetAllEx({
        page: 0,
        page_size: 5,
        order_by: ['-last_update'],
        status: ['published', 'closed', 'failed', 'stopped', 'in_progress', 'completed'],
        type: ['__$not', 'annotation_manual', '__$not', 'annotation', '__$not', 'dataset_import'],
        only_fields: ['type', 'status', 'created', 'name', 'id', 'last_update', 'started', 'project.name'],
        system_tags: ['-archived'],
        user: showOnlyUserWork ? [user.id] : null,
      })
        .pipe(
          mergeMap(res => [new SetRecentTasks(res.tasks as Array<IRecentTask>), deactivateLoader(action.type)]),
          catchError(err => [requestFailed(err), deactivateLoader(action.type)])
        )
    )
  ));

  createProject = createEffect(() => this.actions.pipe(
    ofType<CreateProjectFromDashboard>(DASHBOARD_ACTIONS.CREATE_PROJECT),
    mergeMap((action) => this.projectsApi.projectsCreate(action.payload.project)
      .pipe(
        mergeMap(res => [
          new GetRecentProjects({stats_for_state: ProjectsGetAllExRequest.StatsForStateEnum.Active, order_by: ['-last_update'], page: 0, page_size: CARDS_IN_ROW}),
          deactivateLoader(action.type),
          addMessage(MESSAGES_SEVERITY.SUCCESS, 'Project Created Successfully')]),
        catchError(error => [deactivateLoader(action.type), requestFailed(error),
          addMessage(MESSAGES_SEVERITY.ERROR, 'Project Creation Failed')])
      )
    )
  ));

  addWorkspace = createEffect(() => this.actions.pipe(
    ofType(addWorkspace),
    mergeMap((action) => this.loginApi.loginGetInviteInfo({invite_id: action.inviteId}).pipe(
      map(inviteInfo => [action, inviteInfo]),
      catchError(({error}) => {
        if (error?.meta?.result_code === 400 && error?.meta?.result_subcode === 54) {
          const title = 'link error';
          const body = this.errorService.getErrorMsg(error);
          this.openErrorDialog(title, body, 'al-icon al-ico-get-link-dialog', false);
        }
        return [];
      })
    )),
    mergeMap(([action, inviteInfo]) => this.loginApi.loginJoinCompany({invite_id: action.inviteId}).pipe(
      map(res => {
        this.openWelcomeDialog(inviteInfo);
        return setWorkspace({workspace: {id: res.company_id, name: res.company_name}});
      }),
      catchError(({error}) => {
        const shorterName = inviteInfo.user_given_name || inviteInfo.user_name?.split(' ')[0];
        if (error?.meta?.result_code === 400 && error?.meta?.result_subcode === 61) {
          const title = `${shorterName}’s workspace`;
          const body = `${shorterName}’s workspace is already full. No more members can join.`;
          this.openErrorDialog(title, body, 'i-welcome-researcher', true);
        } else if (error?.meta?.result_code === 400 && error?.meta?.result_subcode === 56) {
          const title = 'link expired';
          const body = this.errorService.getErrorMsg(error);
          this.openErrorDialog(title, body, 'al-icon al-ico-get-link-dialog', false);
        } else {
          const title = 'link error';
          const body = 'Could not resolve link destination.';
          this.openErrorDialog(title, body, 'al-icon al-ico-get-link-dialog', true);
        }
        return [];
      })
    )))
  );

  getInviteInfo = createEffect(() => this.actions.pipe(
    ofType(getInviteInfo),
    mergeMap((action) => this.loginApi.loginGetInviteInfo({invite_id: action.inviteId})),
    map((inviteInfo) => setInviteInfo({inviteInfo}))
  ));

  private openWelcomeDialog(inviteInfo) {
    const shorterName = inviteInfo.user_given_name || inviteInfo.user_name?.split(' ')[0];
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `WELCOME TO ${shorterName ? shorterName + '’S' : 'THE'} WORKSPACE`.toUpperCase(),
        body: `You can now run and view experiments jointly with your team.<br>
Switch between this and other workspaces you are a member of through the profile menu or page.<br>
You can always identify which workspace you’re currently in by its name appearing at the top-left section of the page.<br><br>
If you no longer need to collaborate with this team, you can leave this workspace through the <a href="/profile" target="_blank">profile page</a>.<br><br>
To run experiments in this workspace, use workspace-specific app credentials you can create in the <a href="/profile" target="_blank">profile page</a>.`,
        yes: false,
        no: false,
        iconClass: 'i-welcome-researcher',
      },
      panelClass: 'welcome-dialog'
    });
  }

  private openErrorDialog(title: string, body: string, icon: string, textCenter: boolean) {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: title.toUpperCase(),
        body,
        yes: 'OK',
        no: false,
        iconClass: icon,
      },
      panelClass: textCenter ? 'text-center' : ''
    });
  }
}

