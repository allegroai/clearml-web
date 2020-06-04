import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, Renderer2, ViewChild} from '@angular/core';

@Component({
  selector       : 'al-drawer',
  templateUrl    : './drawer.component.html',
  styleUrls      : ['./drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DrawerComponent implements AfterViewInit {

  public closed              = false;
  public paddingAroundDrawer = 0;

  @Input() label          = '';
  @Input() displayOnHover = false;

  @ViewChild('drawerContainer', { static: true }) drawerContainer: ElementRef;
  @ViewChild('fixedWidth', { static: true }) fixedWidth: ElementRef;
  @ViewChild('closedLabel', { static: true }) closedLabel: ElementRef;

  constructor(private renderer: Renderer2) {
  }

  ngAfterViewInit(): void {
    // Enables animation on width
    this.renderer.setStyle(this.drawerContainer.nativeElement, 'width', this.drawerContainer.nativeElement.clientWidth + 'px');
    // Setting content's width fixed (content should not get squashed)
    // this.renderer.setStyle(this.fixedWidth.nativeElement, 'width', this.drawerContainer.nativeElement.clientWidth - (8 * this.paddingAroundDrawer) + 'px');
  }

  toggleDrawer() {
    if (!this.closed) {
      // 30px padding for 15px padding for label text
      this.renderer.setStyle(this.closedLabel.nativeElement, 'max-height', this.drawerContainer.nativeElement.clientHeight - 30 + 'px');
    } else {
      this.renderer.removeStyle(this.closedLabel.nativeElement, 'max-height');
    }
    this.closed = !this.closed;
  }
}
