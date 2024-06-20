import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import {TemplateFormSectionBaseDirective} from '../../template-forms-ui/templateFormSectionBase';
import {FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {filter, map, startWith} from 'rxjs/operators';
import {Observable, fromEvent, Subscription} from 'rxjs';
import {MatOptionModule, MatOptionSelectionChange} from '@angular/material/core';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger
} from '@angular/material/autocomplete';
import {MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {AsyncPipe, NgFor, NgIf} from '@angular/common';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {ChipsComponent} from '@common/shared/ui-components/buttons/chips/chips.component';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';
import {isArray} from 'lodash-es';


export interface IOption {
  label: string;
  value: string;
}

@Component({
  selector: 'sm-select-autocomplete-with-chips',
  templateUrl: './select-autocomplete-with-chips.component.html',
  styleUrls: ['./select-autocomplete-with-chips.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectAutocompleteWithChipsComponent),
      multi: true
    }],
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, AsyncPipe, MatChipsModule, MatOptionModule, MatFormFieldModule, MatAutocompleteModule, ClickStopPropagationDirective, ChipsComponent, LabeledFormFieldDirective, ReactiveFormsModule]
})

export class SelectAutocompleteWithChipsComponent extends TemplateFormSectionBaseDirective implements OnDestroy, AfterViewInit {
  private _items: { label: string; value: string }[];
  private _focusIt: boolean;
  public loading = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filterText = '';
  isNewName = false;
  public chipCtrl = new FormControl<string | null>(null);
  public filteredItems$: Observable<{ label: string; value: string }[]>;
  private keyDownSub: Subscription;

  protected readonly trackByValue = (index: number, option: IOption) => option?.value ?? option;

  @Input() errorMsg: string;
  @Input() multiple = true;
  @Input() appearance: 'outline' | 'fill';
  @Input() name: string;
  @Input() showSearchIcon = false;
  @Input() formFieldClass: string;
  @Output() customOptionAdded = new EventEmitter<MatOptionSelectionChange>();
  @Input() override disabled = false;
  @Input() clearable = true;
  @Input() placeholder = '';
  @Input() optionAddable = false;
  @Input() autofocus = false;

  @Input() set items(items: { label: string; value: string }[]) {
    this.loading = false;
    this._items = Array.isArray(items) ? items : [items];
    this.chipCtrl.setValue(null);
    this.disabled ? this.chipCtrl.disable() : this.chipCtrl.enable();
  }

  get items() {
    return this._items || [];
  }

  @Input() set focusIt(isFocus) {
    if (isFocus && this.autofocus) {
      this._focusIt = isFocus;
      setTimeout(() => this.autocompleteInput.nativeElement.focus(), 50);
    } else {
      this._focusIt = false;
    }
  }

  get focusIt() {
    return this._focusIt;
  }

  @ViewChild('autocompleteInput') autocompleteInput: ElementRef<HTMLInputElement>;
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;

  override set value(val) {
    super.value = !val || isArray(val) ? val : [val];
  }

  ngOnDestroy() {
    this.keyDownSub?.unsubscribe();
  }

  private _filter(value: string) {
    this.filterText = value;
    const currentVal = !this.val || Array.isArray(this.val) ? this.val : [this.val];
    const currLabels = currentVal?.map(item => item?.label || item) as string[] || [];
    const itemsLabels = this.items.map(item => item.label) as string[];
    this.isNewName = !itemsLabels.includes(value);
    const filterValue = value?.toLowerCase();
    return  this.items.filter(item =>
      item.label?.toLowerCase().includes(filterValue) && !currLabels.includes(item.label)
    );
  }

  displayFn(item: {label: string} | string): string {
    return typeof item === 'string' ? item : item?.label;
  }

  remove(item: IOption) {
    this.value = this.val.filter(it => it.value !== item.value);
    this.chipCtrl.setValue(null);
    this.autocompleteInput.nativeElement.value = '';
  }

  clear() {
    this.value = null;
    this.chipCtrl.setValue(null);
    this.autocompleteInput.nativeElement.value = '';
  }

  add(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    if (!this.optionAddable || this.multiple && this.val.find(option => option.value === value)) {
      return
    }

    if (value) {
      this.value = this.multiple ? this.val.concat([value]) : [value];
      this.chipCtrl.setValue(null);
    }
    event.chipInput!.clear();
  }

  selected(event: MatAutocompleteSelectedEvent) {
    const value = event.option.value;
    this.value = this.multiple ? this.val.concat([value]) : [value];
    this.chipCtrl.setValue(null);
    this.autocompleteInput.nativeElement.value = '';
  }

  removeLastChip() {
    if (Array.isArray(this.val) && this.val.length > 0) {
      this.writeValue(this.val.slice(0, -1));
    } else if (this.val?.value) {
      this.writeValue(null);
      this.filterText = '';
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.keyDownSub = fromEvent(this.autocompleteInput.nativeElement, 'keydown').subscribe((keyDown: KeyboardEvent) => {
        if (keyDown.key === 'Backspace' && (keyDown.target as HTMLInputElement).value === '') {
          this.removeLastChip();
        }

        if (this.autocomplete.panelOpen) {
          keyDown.stopPropagation();
        }
      });

      this.filteredItems$ = this.chipCtrl.valueChanges
        .pipe(
          startWith(''),
          filter(value => typeof value !== 'object' || value === null),
          map(value => value ?? ''),
          map(value => this._filter(value)),
        );
    }, 0);
  }

  trackByFn(index, item) {
    return item?.label ?? item;
  }

  openDropdown () {
    this.autocomplete.panelOpen ? this.autocomplete.closePanel() : this.autocomplete.openPanel();
  }

}
