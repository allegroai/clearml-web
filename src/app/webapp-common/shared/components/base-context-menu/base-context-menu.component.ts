import {Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild} from '@angular/core';
import {MatMenuTrigger} from '@angular/material/menu';
import {TagsMenuComponent} from '../../ui-components/tags/tags-menu/tags-menu.component';
import {Store} from '@ngrx/store';
import {DeactivateEdit, ActivateEdit} from 'app/webapp-common/experiments/actions/common-experiments-info.actions';
import {ActivateModelEdit, CancelModelEdit} from 'app/webapp-common/models/actions/models-info.actions';
import {CountAvailableAndIsDisableSelectedFiltered} from '@common/shared/entity-page/items.utils';
import { MenuItems } from '../../entity-page/items.utils';

@Component({
  selector: 'sm-base-context-menu',
  template: ''
})
export class BaseContextMenuComponent {
  public position = {x: 0, y: 0};
  public menuItems =  MenuItems;

  @ViewChild('tagMenuContent') tagMenu: TagsMenuComponent;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  @Input() selectedDisableAvailable: Record<string, CountAvailableAndIsDisableSelectedFiltered> = {};
  @Input() selectedDisableAvailableIsMultiple = true;
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
  }

  openMenu(position: { x: number; y: number }) {
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

  tagMenuOpened() {
    window.setTimeout(() => {
      this.store.dispatch(new ActivateEdit('tags'));
      this.store.dispatch(new ActivateModelEdit('tags'));
    }, 200);
    this.tagMenu?.focus();
  }

  tagMenuClosed() {
    window.setTimeout(() => {
    this.store.dispatch(new DeactivateEdit());
    this.store.dispatch(new CancelModelEdit());
    }, 200);
    this.tagMenu?.clear();
  }
}
