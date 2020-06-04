import {Pipe, PipeTransform} from '@angular/core';
import {last} from 'lodash/fp';

@Pipe({
  name: 'isAudio'
})
export class IsAudioPipe implements PipeTransform {
  static videoExtensions = ['wav', 'mp3', 'flac', 'mid', 'au', 'ra', 'snd'];

  transform(value: string, args?: any): any {
    const path = value.split('?')[0];
    return IsAudioPipe.videoExtensions.includes(last(path.split('.')));
  }
}
