import {AfterViewInit, Directive, ElementRef, Input} from '@angular/core';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';

@Directive({
  selector: '[smEllipsisMiddleDirective]',
  standalone: true
})
export class EllipsisMiddleDirective implements AfterViewInit {
  private timeoutSubscription: NodeJS.Timer;
  @Input() smEllipsisMiddleDirective: string;
  @Input() delay: number;
  @Input() maxChars: number = Infinity;
  @Input() set triggerEllipsis(triggerEllipsis: number) {
    this.el.nativeElement.innerHTML = this.smEllipsisMiddleDirective;
    this.ngAfterViewInit();
  }
  constructor(private el: ElementRef, private matTooltip: TooltipDirective,) {
  }

  ngAfterViewInit(): void {
    if (this.delay !== undefined) {
      setTimeout( () => this.cropTextToFit(this.el), this.delay);
    } else {
      this.cropTextToFit(this.el);
    }
  }

  private cropTextToFit = (el: ElementRef) => {
    const o = el.nativeElement;
    let txt = o.innerText;
    let ellipsised = txt.includes(' ... ');

    while (o.clientWidth > 10 && o.scrollWidth > o.clientWidth && txt.length > 0 || txt.length > this.maxChars) {
      txt = `${txt.substring(0, txt.length / 2 - 4)} ... ${txt.substring(txt.length / 2 + 4, txt.length)}`;
      o.innerHTML = txt;
      ellipsised = true;
    }

   this.matTooltip.disabled = !ellipsised;
  }
}


