export const isDeletableProject = readyForDeletion => (readyForDeletion.experiments.unarchived + readyForDeletion.models.unarchived) === 0;

export const getDeletePopupEntitiesList = (): string => 'experiments or models';

export const getDeleteProjectPopupStatsBreakdown = (readyForDeletion, statsSubset: 'archived' | 'unarchived' | 'total', experimentCaption): string => `${readyForDeletion.experiments[statsSubset] > 0 ? `${readyForDeletion.experiments[statsSubset]} ${experimentCaption} ` : ''}
          ${readyForDeletion.models[statsSubset] > 0 ? readyForDeletion.models[statsSubset] + ' models ' : ''}`;

export const readyForDeletionFilter = readyForDeletion => !(readyForDeletion.experiments === null || readyForDeletion.models === null);
