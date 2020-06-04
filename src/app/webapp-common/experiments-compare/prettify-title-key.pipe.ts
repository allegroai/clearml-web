import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'prettifyTitleKeyPipe',
  pure: true
})
export class PrettifyTitleKeyPipe implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case 'network_design': return 'Network Design';
      case 'uncommitted_changes': return 'Uncommitted Changes';
      case 'installed_packages': return 'Installed Packages';
      case 'base_docker_image': return 'Base Docker Image';
      case ' input model': return 'Input Model';
      case ' output model': return 'Output Model';
      case ' output model': return 'Output Model';
      case 'model': return 'Model';
      case 'source': return 'Source';
      default:
        return value;
    }

  }

}
