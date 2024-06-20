import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {ActivatedRoute} from '@angular/router';
import {FeaturesEnum} from '~/business-logic/model/users/featuresEnum';
import {ContextMenuService} from '@common/shared/services/context-menu.service';
import {selectRouterConfig} from '@common/core/reducers/router-reducer';
import {Observable, Subscription} from 'rxjs';
import {ORCHESTRATION_ROUTES} from '~/features/workers-and-queues/workers-and-queues.consts';
import {headerActions} from '@common/core/actions/router.actions';

@Component({
  selector: 'sm-orchestration',
  templateUrl: './orchestration.component.html',
  styleUrls: ['./orchestration.component.scss']
})
export class OrchestrationComponent implements OnInit, OnDestroy {
  public queuesManager: boolean;
  featuresEnum = FeaturesEnum;
  private routeConfig$: Observable<string[]>;
  private subs = new Subscription();
  private hasResourceDashboard$: Observable<boolean>;
  private hasApplications$: Observable<boolean>;

  constructor(private dialog: MatDialog, private store: Store, private route: ActivatedRoute, protected contextMenuService: ContextMenuService) {
    this.queuesManager = route.snapshot.data.queuesManager;
    this.routeConfig$ = this.store.select(selectRouterConfig);
  }


  ngOnInit(): void {
    this.subs.add(this.routeConfig$
      .subscribe((conf) => {
        this.setupOrchestrationContextMenu(conf[1]);
      }));
  }

  setupOrchestrationContextMenu(entitiesType,) {
    const contextMenu = ORCHESTRATION_ROUTES
      .map(route => {
        return {
          ...route,
          link: route.header === entitiesType ? undefined : `workers-and-queues/${route.header}`,
          isActive: route.header === entitiesType
        };
      });
    this.store.dispatch(headerActions.setTabs({contextMenu}));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.store.dispatch(headerActions.setTabs({contextMenu: null}));
  }

}
