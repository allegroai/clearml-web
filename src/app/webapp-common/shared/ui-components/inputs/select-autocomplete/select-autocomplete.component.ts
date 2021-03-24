import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, ExistingProvider, forwardRef, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from '@angular/forms';
import {NgSelectComponent} from '@ng-select/ng-select';
import {Subscription} from 'rxjs';
import {getCssTheme} from '../../../utils/shared-utils';

export const SELECT_VALUE_ACCESSOR: ExistingProvider = {
  provide    : NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SelectAutocompleteComponent),
  multi      : true
};

export interface IOption {
  label: string;
  value: string;
}

@Component({
  selector       : 'sm-select-autocomplete',
  templateUrl    : './select-autocomplete.component.html',
  styleUrls      : ['./select-autocomplete.component.scss'],
  providers      : [SELECT_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SelectAutocompleteComponent implements OnInit, ControlValueAccessor, OnDestroy {
  private _items: any;
  private _focusIt: any;
  private valueChangesSub: Subscription;
  public loading: boolean = true;
  public boundAddTag: any;
  public selectData: Array<string> | string;
  public isDarkBackground: boolean;
  @Output() customOptionAdded = new EventEmitter();
  @Output() formDataChanged = new EventEmitter();
  @Input() multiple: boolean = true;
  @Input() showChips: boolean = false;
  @Input() appendTo: string = undefined;

  @Input() set items(items) {
    this.loading = false;
    this._items = items;
  }

  get items() {
    return this._items || [];
  }

  @Input() disable: boolean = false;
  @Input() searchable = true;
  @Input() clearable: boolean = true;
  @Input() placeholder: string = '';
  @Input() optionAddable: boolean = false;
  @Input() formControl: FormControl;
  @Input() formData: any;
  @Input() autofocus: boolean = false;

  @Input() set focusIt(isFocus) {
    if (isFocus && this.autofocus === true) {
      this._focusIt = isFocus;
      this.ngSelectRef.focus();
    } else {
      this._focusIt = false;
    }
  }

  get focusIt() {
    return this._focusIt;
  }

  @ViewChild('ngSelectRef', {static: true}) ngSelectRef: NgSelectComponent;

  private value: any;
  private onChange = (e) => {
  };
  private onTouched = () => {
  };

  constructor(private element: ElementRef, private changeDetection: ChangeDetectorRef, private elRef: ElementRef<HTMLElement>) {
  }

  ngOnInit() {

    this.isDarkBackground = getCssTheme(this.elRef.nativeElement) === 'dark-theme';
    this.ngSelectRef.classes = this.isDarkBackground ? 'dark-theme' : 'light-theme';

    if (!this.formControl) {
      this.formControl = new FormControl(this.formData);
    }
    this.boundAddTag = this.addTag.bind(this);
    this.selectData = this.getLabels(this.formControl.value);
    this.valueChangesSub = this.formControl.valueChanges.subscribe((values) => {
      this.selectData = this.getLabels(values);
      this.formDataChanged.emit(this.selectData);
      this.changeDetection.detectChanges();
    });
    this.overrideNgSelectKeydown();
  }

  addTag(e: any) {
    // We are adding an item to the select, but we don't want to change the form data.
    // customOptionAdded() inputted function will handle changing formData
    const addItem = this.ngSelectRef.itemsList.addItem({label: e, value: e});
    this.ngSelectRef.select(addItem);
    this.customOptionAdded.emit(e);
    // return {label: e, value: e};
  }

  /** ControlValueAccessor interface methods. **/

  writeValue(value: any) {
    this.value = value;
  }

  registerOnChange(fn: () => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disable = isDisabled;
  }

  selectChanged(data) {
    if (data === null || data === '' && !this.clearable) {
      this.selectData = this.formControl.value;
      return;
    }
    const modelData = Array.isArray(data) ? data.map(item => item.value).filter(item => item !== '') :
      data.value ? data.value : '';
    this.formControl.setValue(modelData);
  }

  removeTag(toRemove) {
    this.ngSelectRef.clearItem(toRemove);
    if (!this.multiple) {
      this.formControl.setValue(null);
    }

  }

  overrideNgSelectKeydown() {
    const handleKeyDownCopy = this.ngSelectRef.handleKeyDown.bind(this.ngSelectRef);
    this.ngSelectRef.handleKeyDown = function (e) {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !this.isOpen) {
        return;
      } else {
        if (this.isOpen) {
          e.stopPropagation();
        }
        handleKeyDownCopy(e);
      }
    };
  }

  private getLabels(values) {
    if (!values) return values;
    if (Array.isArray(values)) {
      return values.filter(value => value).map((value) => {
        return this.items.find((item) => item.value === value) || {label: value, value};
      });
    } else {
      return this.items.find((item) => item.value === values) || {label: values, value: values};
    }
  }

  ngOnDestroy(): void {
    this.valueChangesSub.unsubscribe();
  }
}
