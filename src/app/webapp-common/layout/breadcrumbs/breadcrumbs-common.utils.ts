import {IBreadcrumbsLink} from './breadcrumbs.component';
import {isReadOnly} from '../../shared/utils/shared-utils';

export function prepareLinkData(crumb, supportsExamples = false): IBreadcrumbsLink {
  const crumbName = crumb ? crumb.name : '';
  const preparedName = (supportsExamples === true) ? addSuffixForExamples(crumb) : crumbName;
  return crumb ? {name: preparedName, url: crumb.id} : {name: '', url: ''};
}

function addSuffixForExamples(crumb) {
  if (!crumb) {
    return;
  }
  if (isReadOnly(crumb) && crumb.id !== '*') {
    return crumb.name + ' (Example)';
  } else {
    return crumb.name;
  }
}

export function formatStaticCrumb(crumb: string): IBreadcrumbsLink {
  if (!crumb) {
    return {url: null, name: null};
  }
  let name: string;
  switch (crumb) {
    case 'workers-and-queues':
      name = 'Workers & Queues';
      break;
    case 'output':
      name = 'Results';
      break;
    case 'compare-experiments':
      name = 'Compare Experiments';
      break;
    case 'hyper-params':
      name = 'Configuration';
      break;
    case 'general':
      name = 'Info';
      break;
    default:
      name = crumb.charAt(0).toUpperCase() + crumb.slice(1);
      break;
  }
  return {url: crumb, name: name};
}
