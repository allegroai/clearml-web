import {Directive, ElementRef, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {TooltipDirective} from './tooltip.directive';

@Directive({
  selector: '[smShowTooltipIfEllipsis]',
  standalone:  true
})
export class ShowTooltipIfEllipsisDirective {
  constructor(
    private matTooltip: TooltipDirective,
    private elementRef: ElementRef<HTMLElement>
  ) {}
  @Input() showAlwaysTooltip = false;
  @Output() smShowTooltipIfEllipsis = new EventEmitter<boolean>();
  @HostListener('mouseenter', ['$event'])
  setTooltipState(): void {
    if (this.showAlwaysTooltip) {
      return;
    }
    const element = this.elementRef.nativeElement;
    if(element.tagName==='MAT-OPTION' && element.firstElementChild?.tagName==='SPAN' || element.firstElementChild?.classList.contains('ellipsis')){
      this.matTooltip.disabled = element.firstElementChild.scrollWidth === element.firstElementChild.clientWidth;
    } else {
      this.matTooltip.disabled = element.scrollWidth === element.clientWidth;
    }
  }

}
