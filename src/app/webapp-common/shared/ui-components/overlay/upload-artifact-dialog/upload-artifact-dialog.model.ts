import {TemplateRef} from '@angular/core';

export interface UploadArtifactDialogConfig {
  width?: number;
  centerText?: boolean;
  title?: string;
  body?: string;
  task?: string;
  fileName?: string;
  template?: TemplateRef<any>;
  iconClass?: string; // the icon class (see icons.scss).
  iconData?: string; // the icon class (see icons.scss).
}

export interface ArtifactType {
  value: string;
  viewValue: string;
}
