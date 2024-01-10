import {AfterViewInit, Directive, ElementRef, Input, Renderer2} from '@angular/core';
import {escapeRegex} from '@common/shared/utils/escape-regex';

@Directive({
  selector: '[smSearchText]',
  standalone: true
})
export class SearchTextDirective implements AfterViewInit {
  private _term: string;
  @Input() set smSearchText(term: string) {
    this._term = term;
    this.highlightElement();
  }
  get term() {
    return this._term;
  }

  @Input() highlightClass = 'font-weight-bold';

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.highlightElement();
  }

  highlightElement() {
    const text = this.el.nativeElement.innerText;
    if (!text || typeof this.term !== 'string') {
      return;
    }
    const re = new RegExp(escapeRegex(this.term), 'gi');
    const originalTerm = text.match(re)?.[0];
    this.el.nativeElement.innerHTML = '';
    if (originalTerm) {
      text.split(re).forEach((part, index, arr) => {
        this.renderer.appendChild(this.el.nativeElement, this.renderer.createText(part));
        if (index < arr.length - 1) {
          const span = this.renderer.createElement('span');
          this.renderer.addClass(span, this.highlightClass)
          span.innerText = this.term;
          this.renderer.appendChild(this.el.nativeElement, span);
        }
      });
    } else {
      this.renderer.appendChild(this.el.nativeElement, this.renderer.createText(text));
    }
  }
}


