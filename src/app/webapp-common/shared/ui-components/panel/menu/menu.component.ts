import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import {MatMenuTrigger} from '@angular/material/menu';

@Component({
  selector       : 'sm-menu',
  templateUrl    : './menu.component.html',
  styleUrls      : ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent implements AfterViewInit {
  public isMenuOpen: boolean = false;

  @Input() header: string;
  @Input() buttonClass: string;
  @Input() hasButtonClass = true;
  @Input() smMenuClass: string;
  @Input() panelClasses: string;
  @Input() iconClass: string = 'fa fa-caret-down';
  @Input() showCart: boolean = true;
  @Input() openOnInit: boolean = false;
  @Input() showButton: boolean = true;
  @Input() showOverlay: boolean = true;
  @Input() enableSearch: boolean = false;
  @Input() searchValue: string;
  @Input() fixedOptionsSubheader: string;
  @Input() buttonTooltip: string;
  @Input() prefixIconClass: string;
  @Input() set position(position: { x: number; y: number }) {
    this.movePosition(position);
    this._position = position;
  }

  get position() {
    return this._position;
  }
  public _position;
  @Output() onMenuClosed = new EventEmitter();
  @Output() menuClosed = new EventEmitter();
  @Output() menuOpened = new EventEmitter();
  @Output() searchValueChanged = new EventEmitter();
  @ViewChild(MatMenuTrigger, {static: true}) trigger: MatMenuTrigger;
  @ViewChild('menu', {static: true}) menu;

  @HostListener('document:click', ['$event'])
  clickOut(event) {
    if (this.isMenuOpen && !this.showOverlay && !this.eRef.nativeElement.contains(event.target)) {
      this.isMenuOpen = false;
      this.trigger.closeMenu();
    }
  }

  constructor(private renderer: Renderer2, private elRef: ElementRef, protected eRef: ElementRef) {
  }

  ngAfterViewInit(): void {
    if (this.position) {
      this.movePosition(this.position);
    }
    if (this.openOnInit) {
      this.openMenu();
    }
  }

  openMenu() {
    this.isMenuOpen = true;
    this.trigger.openMenu();
  }

  movePosition(position) {
    if (!this.elRef.nativeElement || !position) {
      return;
    }
    this.renderer.setStyle(this.elRef.nativeElement, 'position', 'fixed');
    this.renderer.setStyle(this.elRef.nativeElement, 'left', position.x + 'px');
    this.renderer.setStyle(this.elRef.nativeElement, 'top', position.y + 'px');
  }

  clearSearch() {
    this.searchValue = '';
    this.searchValueChanged.emit({target: {value: ''}});
  }
}
