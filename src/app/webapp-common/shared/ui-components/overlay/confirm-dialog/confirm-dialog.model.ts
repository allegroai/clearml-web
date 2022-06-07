import {TemplateRef} from '@angular/core';

export interface ConfirmDialogConfig {
  width?: number;
  centerText?: boolean;
  title?: string;
  body?: string;
  template?: TemplateRef<any>;
  reference?: string;
  yes?: string;
  no?: string;
  iconClass?: string; // the icon class (see icons.scss).
  iconData?: string; // the icon class (see icons.scss).
  codeSnippet?: string;
  showNeverShowAgain?: boolean;
}
