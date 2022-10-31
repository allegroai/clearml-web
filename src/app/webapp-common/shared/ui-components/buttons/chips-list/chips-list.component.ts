import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, QueryList, Renderer2, ViewChildren} from '@angular/core';
import {ChipsComponent} from '@common/shared/ui-components/buttons/chips/chips.component';
import {trackByIndex} from '@common/shared/utils/forms-track-by';
import {Subscription} from 'rxjs';

@Component({
  selector: 'sm-chips-list',
  templateUrl: './chips-list.component.html',
  styleUrls: ['./chips-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChipsListComponent implements AfterViewInit, OnDestroy {

  private sub = new Subscription();
  private chipsWidth = {};
  public hiddenLabels: string[] = [];
  public trackByIndex = trackByIndex;

  @Input() items: string[];

  @ViewChildren(ChipsComponent) chips: QueryList<ChipsComponent>;

  @Input() set overflowTrigger(name) {
    this.hideChips();
  }

  constructor(private host: ElementRef, private cdr: ChangeDetectorRef, private renderer: Renderer2) {
  }

  ngAfterViewInit(): void {
    this.calcChipsWidth(this.chips);
    this.sub.add(this.chips.changes.subscribe((chips) => {
      this.calcChipsWidth(chips);
      this.hideChips();
    }));
    this.hideChips();
  }

  hideChips() {
    let totalWidth = 0;
    this.hiddenLabels = [];
    this.chips?.forEach(chip => {
      if (totalWidth + this.chipsWidth[chip.label] > this.host.nativeElement.clientWidth - 40) {
        this.hiddenLabels.push(chip.label);
        this.renderer.addClass(chip.elRef.nativeElement, 'hidden');
      } else {
        totalWidth += this.chipsWidth[chip.label];
        this.renderer.removeClass(chip.elRef.nativeElement, 'hidden');
      }
    });
    // if (totalWidth === 0) {
    //   this.hiddenLabels.pop();
    //   this.renderer.removeClass(this.chips.last.elRef.nativeElement, 'hidden');
    // }
    this.cdr.detectChanges();
  }

  calcChipsWidth(chips) {
    chips.forEach(chip => this.chipsWidth[chip.label] = this.chipsWidth[chip.label] || chip.elRef.nativeElement.offsetWidth);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
