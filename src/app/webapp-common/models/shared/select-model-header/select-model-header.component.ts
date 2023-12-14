import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ModelsViewModesEnum} from '../../models.consts';
import {FilterMetadata} from 'primeng/api/filtermetadata';

@Component({
  selector   : 'sm-select-model-header',
  templateUrl: './select-model-header.component.html',
  styleUrls  : ['./select-model-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectModelHeaderComponent {

  public readonly archivedModeOptions = [
    {value: false, label: 'ALL MODELS'},
    {value: true, label: 'ARCHIVE'}
  ];

  public readonly allProjectsdModeOptions = [
    {value: true, label: 'ALL PROJECTS'},
    {value: false, label: 'CURRENT PROJECT'}
  ] as {value: any; label: string}[];


  @Input() searchValue: string;
  @Input() isArchived: boolean;
  @Input() isAllProjects: boolean = true;
  @Input() hideArchiveToggle: boolean;
  @Input() showAllProjectsToggle: boolean;
  @Input() hideCreateNewButton: boolean;
  @Input() viewMode: ModelsViewModesEnum;
  @Input() searchActive: boolean;
  @Input() tableFilters: { [s: string]: FilterMetadata };
  @Input() isShowArchived: boolean;

  @Output() searchValueChanged   = new EventEmitter<string>();
  @Output() isArchivedChanged    = new EventEmitter<boolean>();
  @Output() isAllProjectsChanged = new EventEmitter<boolean>();
  @Output() viewModeChanged      = new EventEmitter<ModelsViewModesEnum>();
  @Output() addModelClicked      = new EventEmitter();
  @Output() clearFilters      = new EventEmitter();

  @ViewChild('search') searchElem;

  onSearchValueChanged(value: string) {
    this.searchValueChanged.emit(value);
  }

  onIsArchivedChanged(value: boolean) {
    this.isArchivedChanged.emit(value);
  }

  onAllProjectsChanged(value: boolean) {
    this.isAllProjectsChanged.emit(value);
  }

  onAddModelClicked() {
    this.addModelClicked.emit();
  }

  // searchClicked() {
  //   this.searchElem.searchBarInput.nativeElement.focus();
  // }

  onSearchFocusOut() {
    if (!this.searchElem.searchBarInput.nativeElement.value) {}
  }
}
