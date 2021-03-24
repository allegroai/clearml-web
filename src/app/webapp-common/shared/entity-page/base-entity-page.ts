import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Store, Action} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import {filter, take, throttleTime} from 'rxjs/operators';
import {Project} from '../../../business-logic/model/projects/project';
import {isReadOnly} from '../utils/shared-utils';
import {selectSelectedProject} from '../../core/reducers/projects.reducer';
import {IOutputData} from 'angular-split/lib/interface';
import {SplitComponent} from 'angular-split';
import {selectRouterParams} from '../../core/reducers/router-reducer';

@Component({
  selector: 'sm-base-entity-page',
  template: ''
})
export abstract class BaseEntityPage implements OnInit, AfterViewInit, OnDestroy {
  protected preventUrlUpdate = false;
  public projectId: string;
  protected selectedProject$: Observable<Project>;
  protected showInfoSub: Subscription;

  public isExampleProject: boolean;
  public selectSplitSize$: Observable<number>;
  public infoDisabled: boolean;
  private dragSub: Subscription;
  protected setSplitSizeAction: any;
  public splitInitialSize: number;
  public minimizedView: boolean;

  @ViewChild('split') split: SplitComponent;

  constructor(protected store: Store<any>) {
    this.selectedProject$ = this.store.select(selectSelectedProject);
    this.selectedProject$.pipe(filter(p => !!p), take(1)).subscribe((project: Project) => {
      this.isExampleProject = isReadOnly(project);
    });
  }

  ngOnInit() {
    this.selectSplitSize$.pipe(filter(x => !!x), take(1))
      .subscribe(x => this.splitInitialSize = x);

    this.showInfoSub = this.store.select(selectRouterParams).subscribe(
      params => {
        const minimized = !!this.getParamId(params);
        if (this.split && this.minimizedView === true && !minimized) {
          this.splitInitialSize = this.split.getVisibleAreaSizes()[1] as number;
        }
        this.minimizedView = minimized;
      }
    );
  }

  ngAfterViewInit() {
    if (this.setSplitSizeAction) {
      this.dragSub = this.split.dragProgress$.pipe(throttleTime(100))
        .subscribe((progress) => this.store.dispatch(this.setSplitSizeAction({splitSize: progress.sizes[1] as number})));
    }
  }

  ngOnDestroy(): void {
    this.dragSub?.unsubscribe();
    this.showInfoSub?.unsubscribe();
  }

  dispatchAndLock(action: Action) {
    this.preventUrlUpdate = true;
    this.store.dispatch(action);
  }

  splitSizeChange(event: IOutputData) {
    this.store.dispatch(this.setSplitSizeAction({splitSize: event.sizes[1] as number}));
    this.infoDisabled = false;
  }

  disableInfoPanel() {
    this.infoDisabled = true;
  }
  clickOnSplit() {
    this.infoDisabled = false;
  }

  protected abstract getParamId(params);
}
