import {AfterViewInit, Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
  selector: '[smEllipsisMiddleDirective]'
})
export class EllipsisMiddleDirective implements AfterViewInit {
  private timeoutSubscription: NodeJS.Timer;

  constructor(private el: ElementRef) {
  }

  ngAfterViewInit(): void {
    this.cropTextToFit(this.el);
  }

  @HostListener('window:resize')
  onResize() {
    clearTimeout(this.timeoutSubscription);
    this.timeoutSubscription = setTimeout(this.cropTextToFit.bind(this, this.el), 75);
  }

  private cropTextToFit = (el: ElementRef) => {
    const o = el.nativeElement;
    let txt = o.innerText;

    while (o.scrollWidth > o.clientWidth && txt.length > 0) {
      txt = txt.substring(0, txt.length / 2 - 1) + txt.substring(txt.length / 2 + 1, txt.length);
      o.innerHTML = txt.substring(0, txt.length / 2) + '...' + txt.substring(txt.length / 2, txt.length);
    }
  };
}


