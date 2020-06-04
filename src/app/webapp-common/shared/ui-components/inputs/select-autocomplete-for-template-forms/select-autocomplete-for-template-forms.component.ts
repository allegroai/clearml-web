import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild} from '@angular/core';
import {TemplateFormSectionBase} from '../../template-forms-ui/templateFormSectionBase';
import {NG_VALUE_ACCESSOR} from '@angular/forms';


export interface IOption {
  label: string;
  value: string;
}

@Component({
  selector: 'sm-select-autocomplete-for-template-forms',
  templateUrl: './select-autocomplete-for-template-forms.component.html',
  styleUrls: ['./select-autocomplete-for-template-forms.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectAutocompleteForTemplateFormsComponent),
      multi: true
    }]
})

export class SelectAutocompleteForTemplateFormsComponent extends TemplateFormSectionBase implements OnInit {
  private _items: any;
  private _focusIt: any;
  public loading: boolean = true;
  public boundAddTag: any;
  @ViewChild('select') select: ElementRef;
  @Input() errorMsg: string;
  @Input() multiple: boolean = true;
  @Input() enableChips: false;
  @Input() name: string;

  @Output() customOptionAdded = new EventEmitter();

  @Input() set items(items) {
    this.loading = false;
    this._items = items;
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

  @ViewChild('ngSelectRef', {static: true}) ngSelectRef;

  ngOnInit() {
    this.boundAddTag = this.addTag.bind(this);
    // const control                   = this.controlDir.control;
    // const validators: ValidatorFn[] = control.validator ? [control.validator] : [];
    // control.setValidators(validators);
    // control.updateValueAndValidity();
    this.overrideNgSelectKeydown();
  }

  addTag(e: any) {
    // We are adding an item to the select, but we don't want to change the form data.
    const addItem = this.ngSelectRef.itemsList.addItem({label: e, value: e});
    this.ngSelectRef.select(addItem);
    this.customOptionAdded.emit(e);
  }


  removeTag(toRemove) {
    this.ngSelectRef.clearItem(toRemove);
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
}
