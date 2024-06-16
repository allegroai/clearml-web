import {
  Component, computed,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Output, viewChild,
} from '@angular/core';
import {MatMenuTrigger} from '@angular/material/menu';
import {TagsMenuComponent} from '../../ui-components/tags/tags-menu/tags-menu.component';
import {Store} from '@ngrx/store';
import {deactivateEdit, activateEdit} from '@common/experiments/actions/common-experiments-info.actions';
import {activateModelEdit, cancelModelEdit} from '@common/models/actions/models-info.actions';
import {CountAvailableAndIsDisableSelectedFiltered} from '@common/shared/entity-page/items.utils';
import {MenuItems} from '../../entity-page/items.utils';
import {selectSelectedProjectId} from '@common/core/reducers/projects.reducer';

@Component({
  selector: 'sm-base-context-menu',
  template: '',
  standalone: true
})
export class BaseContextMenuComponent {
  protected store = inject(Store);
  protected eRef = inject(ElementRef);

  public position = {x: 0, y: 0};
  public menuItems = MenuItems;
  public projectId = this.store.selectSignal(selectSelectedProjectId);
  public allProjects = computed(() => this.projectId() === '*');

  protected tagMenu = viewChild(TagsMenuComponent);
  protected trigger = viewChild(MatMenuTrigger);
  @Input() selectedDisableAvailable: Record<string, CountAvailableAndIsDisableSelectedFiltered> = {};
  @Input() selectedDisableAvailableIsMultiple = true;
  @Input() tableMode: boolean;
  @Input() backdrop: boolean;
  @Output() menuOpened = new EventEmitter();
  @Output() menuClosed = new EventEmitter();

  @HostListener('document:click', ['$event'])
  clickOut(event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.trigger()?.closeMenu();
      this.menuClosed.emit();
    }
  }

  openMenu(position: { x: number; y: number}) {
    if (this.trigger()?.menuOpen) {
      this.trigger().closeMenu();
      this.menuClosed.emit();
    }
    this.position = position;
    window.setTimeout(() => {
      this.trigger().openMenu();
      this.menuOpened.emit();
    }, 100);
  }

  tagMenuOpened(tagMenuRef?: TagsMenuComponent) {
    window.setTimeout(() => {
      this.store.dispatch(activateEdit('tags'));
      this.store.dispatch(activateModelEdit('tags'));
    }, 200);
    tagMenuRef ? tagMenuRef.focus() : this.tagMenu()?.focus();
  }

  tagMenuClosed(tagMenuRef?: TagsMenuComponent) {
    window.setTimeout(() => {
      this.store.dispatch(deactivateEdit());
      this.store.dispatch(cancelModelEdit());
    }, 200);
    tagMenuRef ? tagMenuRef.clear() : this.tagMenu()?.clear();
  }
}
