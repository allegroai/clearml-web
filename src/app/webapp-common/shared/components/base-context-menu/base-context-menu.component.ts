import {Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output, ViewChild} from '@angular/core';
import {MatMenuTrigger} from '@angular/material/menu';
import {TagsMenuComponent} from '../../ui-components/tags/tags-menu/tags-menu.component';
import {Store} from '@ngrx/store';
import {deactivateEdit, activateEdit} from 'app/webapp-common/experiments/actions/common-experiments-info.actions';
import {ActivateModelEdit, CancelModelEdit} from 'app/webapp-common/models/actions/models-info.actions';
import {CountAvailableAndIsDisableSelectedFiltered} from '@common/shared/entity-page/items.utils';
import {MenuItems} from '../../entity-page/items.utils';
import {selectRouterParams} from '@common/core/reducers/router-reducer';
import {map} from 'rxjs/operators';
import {Subscription} from 'rxjs';

@Component({
  selector: 'sm-base-context-menu',
  template: ''
})
export class BaseContextMenuComponent implements OnDestroy{
  public position = {x: 0, y: 0};
  public menuItems = MenuItems;
  public projectId: string;
  protected sub = new Subscription();

  @ViewChild('tagMenuContent') tagMenu: TagsMenuComponent;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  @Input() selectedDisableAvailable: Record<string, CountAvailableAndIsDisableSelectedFiltered> = {};
  @Input() selectedDisableAvailableIsMultiple = true;
  @Input() tableMode: boolean;
  @Input() backdrop: boolean;
  @Output() menuOpened = new EventEmitter();
  @Output() menuClosed = new EventEmitter();

  @HostListener('document:click', ['$event'])
  clickOut(event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.trigger?.closeMenu();
      this.menuClosed.emit();
    }
  }

  constructor(
    protected store: Store<any>,
    protected eRef: ElementRef
  ) {
    this.sub.add(store.select(selectRouterParams)
      .pipe(map(params => params?.projectId))
      .subscribe(id => this.projectId = id)
    );
  }

  openMenu(position: { x: number; y: number}) {
    if (this.trigger?.menuOpen) {
      this.trigger.closeMenu();
      this.menuClosed.emit();
    }
    this.position = position;
    window.setTimeout(() => {
      this.trigger.openMenu();
      this.menuOpened.emit();
    }, 100);
  }

  tagMenuOpened(tagMenuRef?: TagsMenuComponent) {
    window.setTimeout(() => {
      this.store.dispatch(activateEdit('tags'));
      this.store.dispatch(new ActivateModelEdit('tags'));
    }, 200);
    tagMenuRef ? tagMenuRef.focus() : this.tagMenu?.focus();
  }

  tagMenuClosed(tagMenuRef?: TagsMenuComponent) {
    window.setTimeout(() => {
      this.store.dispatch(deactivateEdit());
      this.store.dispatch(new CancelModelEdit());
    }, 200);
    tagMenuRef ? tagMenuRef.clear() : this.tagMenu?.clear();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
