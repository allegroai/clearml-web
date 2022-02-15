import {Directive, ElementRef, HostListener, Input} from '@angular/core';
import {ColorHashService} from '../../../services/color-hash/color-hash.service';
import {normalizeColorToString} from '../../../services/color-hash/color-hash.utils';
import {Store} from '@ngrx/store';
import {showColorPicker} from './choose-color.actions';

@Directive({
  selector: '[smChooseColor]',
})
export class ChooseColorDirective {
  readonly colorTopOffset    = 100;
  readonly colorPickerWidth  = 230;
  readonly colorPickerHeight = 460 - this.colorTopOffset;
  @Input() colorButtonRef;
  @Input() colorButtonClass: string;
  @Input() stringToColor: string;
  @Input() colorPickerWithAlpha: boolean = false;
  private _defaultColor: number[];
  private defaultColorString: string;

  @Input() set defaultColor(defaultColor: number[]) {
    this._defaultColor = defaultColor;
    this.defaultColorString = normalizeColorToString(defaultColor);
  }

  get defaultColor() {
    return this._defaultColor;
  }

  @HostListener('mousedown', ['$event'])
  public onMouseDown(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
  }

  @HostListener('click', ['$event'])
  public onClick(event: MouseEvent): void {
    const elementsWithClass = this.colorButtonClass ? Array.from(this.el.nativeElement.querySelectorAll(this.colorButtonClass)) : [];
    const matchingEl        = elementsWithClass.find(el => el === event.target);
    const matchingRef       = this.colorButtonRef && this.colorButtonRef.nativeElement ? this.colorButtonRef.nativeElement : this.colorButtonRef;

    if (matchingEl || matchingRef === event.target) {
      event.stopPropagation();
      this.openColorPicker(event);
    }
  }

  constructor(private el: ElementRef, private store: Store<any>) {}

  openColorPicker(event: MouseEvent) {
    let top = event.pageY - (this.colorPickerHeight / 3);
    let left = event.pageX;
    if (event.pageY + this.colorPickerHeight >= (window.innerHeight || document.documentElement.clientHeight)) {
      top = (event.pageY) - this.colorPickerHeight;
    }
    if (event.clientX + this.colorPickerWidth >= (window.innerWidth || document.documentElement.clientWidth)) {
      left = (event.clientX) - this.colorPickerWidth;
    }

    this.store.dispatch(showColorPicker({
      top,
      left,
      theme: 'light',
      defaultColor: this.defaultColorString,
      cacheKey: this.stringToColor,
      alpha: this.colorPickerWithAlpha
    }));
    event.stopPropagation();
  }

}

export const attachColorChooser = (text: string, buttonElement: Element, colorHash: ColorHashService, store: Store<any>, withAlpha?: boolean) => {
  const directive = new ChooseColorDirective(new ElementRef(buttonElement), store);
  directive.colorButtonRef = new ElementRef(buttonElement);
  directive.stringToColor  = text;
  directive.colorPickerWithAlpha = withAlpha;
  const listener = (e: MouseEvent) => {
    directive.defaultColor = colorHash.initColor(text);
    directive.openColorPicker(e);
  };
  buttonElement.removeEventListener('click', listener);
  buttonElement.addEventListener('click', listener);
};
