import { Component, Input, EventEmitter, Output, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { TIME_FORMAT_STRING } from '../../constants';
import { getUsers, getGroups, getCompanys, delCompany, delGroup, delUser, setSelected } from '../user-domain.actions';
import { selectCurrentUser } from '../../core/reducers/users-reducer';
import { filter, take } from 'rxjs/operators';
import { IUser, selectUsers, selectGroups, selectCompanys, IGroup, ICompany } from '../user-domain.reducer';
import { ColHeaderTypeEnum, ISmCol } from '@common/shared/ui-components/data/table/table.consts';
import { ConfirmDialogComponent } from '@common/shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import { UserCreateDialogComponent } from '../userdialog/user-create-dialog.component';

const USER_TABLE_COLS: ISmCol[] = [
  {
    id: 'id',
    headerType: ColHeaderTypeEnum.title,
    header: 'ID',
    bodyStyleClass: 'type-col',
    disableDrag: true,
    disablePointerEvents: true
  },
  {
    id: 'name',
    headerType: ColHeaderTypeEnum.title,
    header: 'Name',
    disableDrag: true,
    disablePointerEvents: true
  },
  {
    id: 'role',
    headerType: ColHeaderTypeEnum.title,
    header: 'Role',
    disableDrag: true,
    disablePointerEvents: true
  },
  {
    id: 'groups',
    headerType: ColHeaderTypeEnum.title,
    header: 'Groups',
    disableDrag: true,
    disablePointerEvents: true
  },
  {
    id: 'family_name',
    headerType: ColHeaderTypeEnum.title,
    header: 'Family Name',
    disableDrag: true,
    disablePointerEvents: true
  },
  {
    id: 'given_name',
    headerType: ColHeaderTypeEnum.title,
    header: 'Given Name',
    disableDrag: true,
    disablePointerEvents: true
  },
  {
    id: 'created',
    headerType: ColHeaderTypeEnum.title,
    header: 'Created',
    disableDrag: true,
    disablePointerEvents: true
  },
  {
    id: 'status',
    headerType: ColHeaderTypeEnum.title,
    header: 'Status',
    bodyStyleClass: 'status-col',
    disableDrag: true,
    disablePointerEvents: true
  }
];

const GROUP_TABLE_COLS: ISmCol[] = [
  {
    id: 'id',
    headerType: ColHeaderTypeEnum.title,
    header: 'ID',
    bodyStyleClass: 'type-col',
    disableDrag: true,
    disablePointerEvents: true
  },
  {
    id: 'name',
    headerType: ColHeaderTypeEnum.title,
    header: 'Name',
    disableDrag: true,
    disablePointerEvents: true
  },
  {
    id: 'members',
    headerType: ColHeaderTypeEnum.title,
    header: 'Members',
    disableDrag: true,
    disablePointerEvents: true
  },
  {
    id: 'description',
    headerType: ColHeaderTypeEnum.title,
    header: 'Description',
    disableDrag: true,
    disablePointerEvents: true
  },
  {
    id: 'last_update',
    headerType: ColHeaderTypeEnum.title,
    header: 'Update',
    disableDrag: true,
    disablePointerEvents: true
  },
  {
    id: 'created',
    headerType: ColHeaderTypeEnum.title,
    header: 'Created',
    disableDrag: true,
    disablePointerEvents: true
  }
];

const COMPANY_TABLE_COLS: ISmCol[] = [
  {
    id: 'id',
    headerType: ColHeaderTypeEnum.title,
    header: 'ID',
    bodyStyleClass: 'type-col',
    disableDrag: true,
    disablePointerEvents: true
  },
  {
    id: 'name',
    headerType: ColHeaderTypeEnum.title,
    header: 'Name',
    disableDrag: true,
    disablePointerEvents: true
  },
  {
    id: 'description',
    headerType: ColHeaderTypeEnum.title,
    header: 'Description',
    disableDrag: true,
    disablePointerEvents: true
  },
  {
    id: 'last_update',
    headerType: ColHeaderTypeEnum.title,
    header: 'Update',
    disableDrag: true,
    disablePointerEvents: true
  },
  {
    id: 'created',
    headerType: ColHeaderTypeEnum.title,
    header: 'Created',
    disableDrag: true,
    disablePointerEvents: true
  }
];

@Component({
  selector: 'sm-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
})
export class UsersListComponent implements OnInit {
  public contextMenuActive: boolean;
  private dialog: MatDialogRef<UserCreateDialogComponent>;
  public userCols: Array<ISmCol>;
  public groupCols: Array<ISmCol>;
  public companyCols: Array<ISmCol>;
  public listUsers$: Observable<Array<IUser>>;
  public listGroups$: Observable<Array<IGroup>>;
  public listCompanys$: Observable<Array<ICompany>>;

  public users: Array<IUser>;
  public companys: Array<ICompany>;
  public groups: Array<IGroup>;

  public shouldBeEditUser: IUser = null;
  public timeFormatString = TIME_FORMAT_STRING;

  @Input() menuOpen: boolean;
  @Input() selectedItem;
  @Input() menuPosition;
  @Input() activeTable;

  @Output() userSelected = new EventEmitter();

  constructor(private store: Store<any>,
    private matDialog: MatDialog,
    private router: Router,
    private changeDetector: ChangeDetectorRef) {
    this.listUsers$ = this.store.pipe(select(selectUsers));
    this.listGroups$ = this.store.pipe(select(selectGroups));
    this.listCompanys$ = this.store.pipe(select(selectCompanys));

    this.shouldBeEditUser = this.listUsers$[0];

    this.userCols = USER_TABLE_COLS;
    this.groupCols = GROUP_TABLE_COLS;
    this.companyCols = COMPANY_TABLE_COLS;
  }

  ngOnInit() {
    this.store.select(selectCurrentUser)
      .pipe(filter(user => !!user), take(1))
      .subscribe(() => {
        this.store.dispatch(getUsers());
        this.store.dispatch(getGroups());
        this.store.dispatch(getCompanys());
      });
  }

  public getElapsedTime(started = null, completed = null) {
    const now = new Date();
    const startTime = new Date(started);
    const completedTime = new Date(completed);
    const todayAtMidn = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayAtMidn = new Date(todayAtMidn);
    yesterdayAtMidn.setDate(yesterdayAtMidn.getDate() - 1);

    const hours = this.convertMinsToHrsMins(completedTime.getTime() - startTime.getTime());
    let elapsedTimeString = hours;
    if (completedTime.getTime() > todayAtMidn.getTime()) {
      elapsedTimeString += ` Hrs (${completedTime.toLocaleTimeString()})`;
    } else if (completedTime.getTime() > yesterdayAtMidn.getTime()) {
      elapsedTimeString += ` Hrs (Yesterday)`;
    } else {
      elapsedTimeString += ` (${completedTime.toLocaleDateString('en-GB')})`;
    }
    return elapsedTimeString;
  }

  private convertMinsToHrsMins(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const H = h < 10 ? '0' + h : h;
    const M = m < 10 ? '0' + m : m;
    return `${H}:${M}`;
  }

  public openCreateUserDialog() {
    this.listCompanys$.subscribe(companys => this.companys = companys);
    this.listGroups$.subscribe(groups => this.groups = groups);

    this.dialog = this.matDialog.open(UserCreateDialogComponent, {
      panelClass: 'light-theme',
      data: {
        editMode: false,
        mode: 'user',
        companys: this.companys,
        groups: this.groups,
      },
    });
    this.dialog.afterClosed().subscribe(userHasBeenCreated => {
      if (userHasBeenCreated) {
        this.store.dispatch(getUsers());
      }
    });
  }

  public openCreateGroupDialog() {
    this.listCompanys$.subscribe(companys => this.companys = companys);
    this.listUsers$.subscribe(user => this.users = user);

    this.dialog = this.matDialog.open(UserCreateDialogComponent, {
      panelClass: 'light-theme',
      data: {
        editMode: false,
        mode: 'group',
        companys: this.companys,
        users: this.users
      }
    });
    this.dialog.afterClosed().subscribe(userHasBeenCreated => {
      if (userHasBeenCreated) {
        this.store.dispatch(getGroups());
      }
    });
  }

  public openCreateCompanyDialog() {
    this.dialog = this.matDialog.open(UserCreateDialogComponent, {
      panelClass: 'light-theme',
      data: {
        editMode: false,
        mode: 'company',
      }
    });
    this.dialog.afterClosed().subscribe(userHasBeenCreated => {
      if (userHasBeenCreated) {
        this.store.dispatch(getCompanys());
      }
    });
  }

  public deleteItemData(data, type) {
    const dialogRef = this.matDialog.open(ConfirmDialogComponent,
      {
        data: {
          title: '你确定需要删除当前数据',
          body: ``,
          yes: 'Sure',
          no: 'Cacnel',
          iconClass: 'i-terms',
        }
      });
    this.store.dispatch(setSelected({ data }));
    dialogRef.afterClosed().subscribe((allowed: boolean) => {
      if (allowed) {
        // 确认 后续操作， 删除， reload data
        switch (type) {
          case 'user':
            this.store.dispatch(delUser(data));
            break;
          case 'group':
            this.store.dispatch(delGroup(data));
            break;
          case 'company':
            this.store.dispatch(delCompany(data));
            break;
          default:
            break;
        }
      }
    });
  }

  public editItemData(data, type) {
    this.listCompanys$.subscribe(companys => this.companys = companys);
    this.listUsers$.subscribe(users => this.users = users);

    this.dialog = this.matDialog.open(UserCreateDialogComponent, {
      panelClass: 'light-theme',
      data: {
        editMode: true,
        mode: type,
        companys: this.companys,
        users: this.users,
        current: data,
      },
    });
    this.dialog.afterClosed().subscribe(userHasBeenCreated => {
      if (userHasBeenCreated) {
        this.store.dispatch(getUsers());
      }
    });
  }

  public openContextMenu(data, type: string) {
    data.e.preventDefault();
    this.menuOpen = false;
    setTimeout(() => {
      this.selectedItem = data.rowData;
      this.activeTable = type;
      this.menuPosition = { x: data.e.clientX, y: data.e.clientY };

      this.menuOpen = true;
      this.changeDetector.detectChanges();
    }, 0);
  }

  public onRowClick(data) {
    this.selectedItem = data.rowData;
    this.changeDetector.detectChanges();
  }
}
