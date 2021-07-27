import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import {TemplateFormSectionBase} from '../../template-forms-ui/templateFormSectionBase';
import {NG_VALUE_ACCESSOR, NgForm} from '@angular/forms';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {map, startWith} from 'rxjs/operators';
import {fromEvent, Subscription} from 'rxjs';
import {Observable} from 'rxjs/internal/Observable';
import {MatOptionSelectionChange} from '@angular/material/core';
import {MatAutocompleteTrigger} from '@angular/material/autocomplete';


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
    }]
})

export class SelectAutocompleteWithChipsComponent extends TemplateFormSectionBase implements OnDestroy, AfterViewInit {
  private _items: { label: string; value: string }[];
  private _focusIt: any;
  public loading: boolean = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filterText: string = '';
  isNewName: boolean = false;
  @Input() errorMsg: string;
  @Input() multiple: boolean = true;
  @Input() appearance: 'outline' | 'fill';
  @Input() name: string;
  @Input() showSearchIcon: boolean = false;
  @Input() formFieldClass: string;
  @Output() customOptionAdded = new EventEmitter<MatOptionSelectionChange>();
  public filteredItems: Observable<{ label: string; value: string }[]>;
  private keyDownSub: Subscription;

  @Input() set items(items: { label: string; value: string }[]) {
    this.loading = false;
    this._items = items;
    this.autoSelectForm?.controls[this.name]?.setValue('');
    this.cdr.detectChanges();
  }

  get items() {
    return this._items || [];
  }

  @Input() disabled: boolean = false;
  @Input() clearable: boolean = true;
  @Input() placeholder: string = '';
  @Input() optionAddable: boolean = false;
  @Input() autofocus: boolean = false;

  @Input() set focusIt(isFocus) {
    if (isFocus && this.autofocus) {
      this._focusIt = isFocus;
      setTimeout(() => this.autocompleteInput.nativeElement.focus());
    } else {
      this._focusIt = false;
    }
  }

  get focusIt() {
    return this._focusIt;
  }

  @ViewChild('autoSelectForm', {static: true}) autoSelectForm: NgForm;
  @ViewChild('autocompleteInput') autocompleteInput: ElementRef<HTMLInputElement>;
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }
  ngOnDestroy() {
    this.keyDownSub?.unsubscribe();
  }

  private _filter(value: string) {
    this.filterText = value;
    const currentVal = Array.isArray(this.val) ? this.val : [this.val];
    const currLabels = currentVal?.map(item => item?.label || item) as string[] || [];
    const itemsLabels = this.items.map(item => item.label) as string[];
    this.isNewName = !itemsLabels.includes(value);
    const filterValue = value?.toLowerCase();
    return this.items.filter((item: any) =>
      item.label?.toLowerCase().includes(filterValue) &&
      !currLabels.includes(item.label)
    );
  }

  displayFn(item: any): string {
    return item && item.label ? item.label : item;
  }

  remove(item?: any) {
    this.writeValue(this.multiple ? this.val.filter(it => it !== item) : undefined);
  }

  selected($event: any): void {
    if (typeof $event === 'string') {
      return;
    }
    this.writeValue(this.multiple ? this.val.concat([$event]) : $event);
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

      if (!this.autoSelectForm.controls[this.name]) {
        return;
      }
      this.filteredItems = this.autoSelectForm.controls[this.name].valueChanges
        .pipe(
          startWith(''),
          map(value => typeof value === 'string' ? value : ''),
          map(value => this._filter(value)),
        );
    }, 0);

  }
}
