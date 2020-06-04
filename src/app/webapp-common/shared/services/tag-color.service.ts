import { Injectable } from '@angular/core';
import {setTagColors, TagColor} from '../../core/actions/projects.actions';
import {Store} from '@ngrx/store';
import {selectTagColors, selectTagsColors} from '../../core/reducers/projects.reducer';
import {Subscription} from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class TagColorService {
  public static predefined = [
    {foreground: 'white', background: '#803d3d'},
    {foreground: 'white', background: '#833e65'},
    {foreground: 'white', background: '#492d4e'},
    {foreground: 'white', background: '#5b3b80'},
    {foreground: 'white', background: '#38406e'},
    {foreground: 'white', background: '#013b6a'},
    {foreground: 'white', background: '#023f5c'},
    {foreground: 'white', background: '#385879'},
    {foreground: 'white', background: '#3a7777'},
    {foreground: 'white', background: '#326c34'},
    {foreground: 'white', background: '#2e521b'},
    {foreground: 'white', background: '#44573f'},
    {foreground: 'white', background: '#605c2b'},
    {foreground: 'white', background: '#846300'},
    {foreground: 'white', background: '#895200'},
    {foreground: 'white', background: '#7b331e'},
    {foreground: 'white', background: '#6e5056'},
    {foreground: 'white', background: '#596c71'},
    {foreground: 'white', background: '#2a4958'},
    {foreground: 'white', background: '#434141'},
  ] as TagColor[];

  private tagsColors: { [p: string]: TagColor };

  constructor(private store: Store) {
    store.select(selectTagsColors).subscribe(tagsColors => this.tagsColors = tagsColors);
  }

  getColor(tag: string) {
    return this.store.select(selectTagColors, {tag})
      .pipe(map(tagColor => tagColor ? tagColor : this.calcColor(tag) ));
  }

  calcColor(tag: string) {
    const sum = Array.from(tag)
      .map(chr => chr.charCodeAt(0))
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    return  {...TagColorService.predefined[sum % 20]};
  }

  setColor(tag: string, colors: Partial<TagColor>) {
    if (!colors.background || !colors.foreground) {
      const curr = this.tagsColors[tag] || this.calcColor(tag);
      this.store.dispatch(setTagColors({tag, colors: {
        background: colors.background || curr.background,
        foreground: colors.foreground || curr.foreground
      }}));
    } else {
      this.store.dispatch(setTagColors({tag, colors: colors as TagColor}));
    }
  }
}

