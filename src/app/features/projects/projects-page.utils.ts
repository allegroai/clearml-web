export function isDeletableProject(readyForDeletion) {
  return (readyForDeletion.experiments.unarchived + readyForDeletion.models.unarchived) === 0;
}

export function getDeletePopupEntitiesList(): string {
  return 'experiments or models';
}

export function getDeleteProjectPopupStatsBreakdown(readyForDeletion, statsSubset: 'archived' | 'unarchived' | 'total'): string {
  return `${readyForDeletion.experiments[statsSubset] > 0 ? readyForDeletion.experiments[statsSubset] + ' experiments ' : ''}
          ${readyForDeletion.models[statsSubset] > 0 ? readyForDeletion.models[statsSubset] + ' models ' : ''}`;
}

export function readyForDeletionFilter(readyForDeletion) {
  return !(readyForDeletion.experiments === null || readyForDeletion.models === null);
}
