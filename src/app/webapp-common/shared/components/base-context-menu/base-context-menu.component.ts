import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {MatMenuTrigger} from '@angular/material/menu';
import {TagsMenuComponent} from '../../ui-components/tags/tags-menu/tags-menu.component';
import {getTags} from '../../../core/actions/projects.actions';
import {Store} from '@ngrx/store';

@Component({
  selector: 'sm-base-context-menu',
  template: ''
})
export class BaseContextMenuComponent {
  public position = {x: 0, y: 0};

  @ViewChild('tagMenuContent') tagMenu: TagsMenuComponent;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  @HostListener('document:click', ['$event'])
  clickOut(event) {
    if(!this.eRef.nativeElement.contains(event.target)) {
      this.trigger.closeMenu();
    }
  }

  constructor(
    protected store: Store<any>,
    protected eRef: ElementRef
  ) {}

  openMenu(position: {x: number; y: number}) {
    if (this.trigger.menuOpen) {
      this.trigger.closeMenu();
    }
    this.position = position;
    window.setTimeout(() => {
      this.trigger.openMenu();
    }, 100);
  }

  tagMenuOpened() {
    this.store.dispatch(getTags());
    this.tagMenu.focus();
  }
}
