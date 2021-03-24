export interface IConfirmDialogConfig {
  title?: string;
  body?: string;
  reference?: string;
  yes?: string;
  no?: string;
  iconClass?: string; // the icon class (see icons.scss).
  codeSnippet?: string;
  showNeverShowAgain?: boolean;
}
