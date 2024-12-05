import {Component, Input, ViewChild} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {MatTabNav, MatTabsModule} from '@angular/material/tabs';
import {AsyncPipe, NgForOf, UpperCasePipe} from '@angular/common';
import {Store} from '@ngrx/store';
import {selectRouterConfig} from '@common/core/reducers/router-reducer';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {debounceTime} from 'rxjs/operators';
import {PushPipe} from '@ngrx/component';

export interface Link {
  name: string;
  url: string[];
  activeBy?: string;
}

@Component({
  selector: 'sm-router-tab-nav-bar',
  templateUrl: './router-tab-nav-bar.component.html',
  styleUrls: ['./router-tab-nav-bar.component.scss'],
  imports: [
    AsyncPipe,
    MatTabsModule,
    RouterLink,
    UpperCasePipe,
    RouterLinkActive,
    NgForOf,
    PushPipe,
  ],
  standalone: true
})
export class RouterTabNavBarComponent {
  routerConfig$: Observable<string[]>;
  private sub = new Subscription();
  private resize$ = new BehaviorSubject(0);

  @Input() links: Link[] = [];
  @Input() set splitSize(size: number) {
    this.resize$.next(size);
  }

  @ViewChild(MatTabNav) matTabNav: MatTabNav;
  trackByLink = (index: number, link: Link) => link.url.join(',');

  constructor(private store: Store) {
    this.routerConfig$ = this.store.select(selectRouterConfig);

    this.sub.add(this.resize$.pipe(debounceTime(50)).subscribe(() => this.matTabNav.updatePagination()));
    window.setTimeout(() => this.resize$.next(1), 500);
  }
}
