import {selectCurrentUser} from '@common/core/reducers/users-reducer';
import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectSelectedProjectId} from '@common/core/reducers/projects.reducer';
import {fromEvent, Observable} from 'rxjs';
import {ConfigurationService} from '@common/shared/services/configuration.service';
import {searchDeactivate} from '@common/dashboard-search/dashboard-search.actions';

@Component({
  selector   : 'sm-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls  : ['./side-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideNavComponent implements AfterViewInit {
  public selectedProjectId$: Observable<any>;
  currentUser: any;
  environment = ConfigurationService.globalEnvironment;
  public scrolling: boolean;

  @ViewChild('container') container: ElementRef<HTMLDivElement>;


  constructor(public store: Store<any>, private cdr: ChangeDetectorRef) {
    this.selectedProjectId$ = this.store.select(selectSelectedProjectId);
    this.store.select(selectCurrentUser).subscribe((res) => this.currentUser = res);

    fromEvent(window, 'resize').subscribe(() => {
      const scrolling = this.container.nativeElement.scrollHeight > this.container.nativeElement.clientHeight;
      if (scrolling !== this.scrolling) {
        this.scrolling = scrolling;
        this.cdr.detectChanges();
      }
      this.scrolling = scrolling;
    });
  }

  ngAfterViewInit(): void {
    this.scrolling = this.container.nativeElement.scrollHeight > this.container.nativeElement.clientHeight;
  }

  public resetSearch() {
    this.store.dispatch(searchDeactivate());
  }

  get guestUser(): boolean {
    return this.currentUser && this.currentUser?.role === 'guest';
  }
}
