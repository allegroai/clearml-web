export interface HeaderNavbarTabConfig {
  header: string;
  subHeader: string;
  badge?: string;
  badgeTooltip?: string;
  permissionCheck?: string;
  link?: string | string[];
  isActive: boolean;
  featureLink?: string;
  featureName?: string;
  id?: string;
}
