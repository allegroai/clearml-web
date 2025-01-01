import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  inject,
  viewChildren,
  computed,
  signal, effect
} from '@angular/core';
import {ChipsComponent} from '@common/shared/ui-components/buttons/chips/chips.component';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {interval} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {filter, take} from 'rxjs/operators';

@Component({
  selector: 'sm-chips-list',
  templateUrl: './chips-list.component.html',
  styleUrls: ['./chips-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ChipsComponent,
    TooltipDirective
  ]
})
export class ChipsListComponent {
  private host = inject(ElementRef);

  items = input<string[]>();
  overflowTrigger = input<number>();

  private chips = viewChildren(ChipsComponent);

  protected readyState = computed(() => ({
    resize: this.overflowTrigger(),
    ready: signal(false)
  }));
  private chipsWidth = computed(() => {
    if (!this.readyState().ready()) {
      return [];
    }
    return this.chips().map(chip => chip.elRef.nativeElement.offsetWidth);
  });

  protected visibleLabelsLen = computed(() => {
    if(!this.readyState().ready()) {
      return this.chips().length;
    }
    const containerWidth =  this.overflowTrigger() || this.host.nativeElement.clientWidth;
    let totalWidth = 32;
    let len = 0
    while (totalWidth < containerWidth) {
      totalWidth += this.chipsWidth()[len];
      len++;
    }
    return len - 2;
  });

  protected hiddenLabels = computed(() => this.chips()
    .filter((chip, index) => index > this.visibleLabelsLen())
    .map(chip => chip.label)
  );

  constructor() {
    effect(() => {
      this.overflowTrigger();
      interval(10)
        .pipe(
          take(50),
          filter(() => this.chips()?.at(-1)?.elRef.nativeElement.offsetWidth > 0),
          take(1)
        )
        .subscribe(() => this.readyState().ready.set(true));
    });
  }
}
