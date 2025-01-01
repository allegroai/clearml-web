import {Component, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectThemeMode} from '@common/core/reducers/view.reducer';

@Component({
  selector: 'sm-page-base',
  template: '',
  standalone: true
})
export abstract class PageBaseComponent {
  private readonly store= inject(Store);
  protected theme = this.store.selectSignal(selectThemeMode);

  imageClicked(image: HTMLImageElement) {
    if (image.classList.contains('full-screen')) {
      image.classList.remove('full-screen');
      image.parentElement.classList.remove('full-screen')
    } else {
      image.classList.add('full-screen');
      image.parentElement.classList.add('full-screen');
    }
  }
}
