import {IBreadcrumbsLink} from './breadcrumbs.component';
import {isExample} from '../../shared/utils/shared-utils';

const addSuffixForExamples = crumb => {
  if (!crumb?.name) {
    return;
  }
  if (isExample(crumb) && crumb.id !== '*') {
    return crumb.name + ' (Example)';
  } else {
    return crumb.name;
  }
};

export const prepareLinkData = (crumb, supportsExamples = false): IBreadcrumbsLink => {
  const crumbName = crumb ? crumb.name : '';
  const preparedName = (supportsExamples === true) ? addSuffixForExamples(crumb) : crumbName;
  return crumb ? {name: preparedName, url: crumb.id} : {name: '', url: ''};
};

export const formatStaticCrumb = (crumb: string): IBreadcrumbsLink => {
  if (!crumb) {
    return {url: null, name: null};
  }
  let name: string;
  switch (crumb) {
    case 'workers-and-queues':
      return {name: 'Workers & Queues', url: null};
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
    case 'account-administration':
      name = 'Access Controls';
      break;
    case ':projectId':
      name = 'All Experiments';
      break;
    case 'experiments':
      return {name: 'All Experiment', url: null};
    case 'models':
      return {name: 'All Models', url: null};
    default:
      name = crumb.charAt(0).toUpperCase() + crumb.slice(1);
      break;
  }
  return {url: crumb, name};
};
