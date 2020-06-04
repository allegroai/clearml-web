export function isDeletableProject(readyForDeletion) {
  return (readyForDeletion.experiments + readyForDeletion.models) === 0;
}


export function getDeleteProjectPopupBody(readyForDeletion) {
  return `You cannot delete a project with un-archived experiments, or models. <br/>
          You have:
          ${readyForDeletion.experiments > 0 ? readyForDeletion.experiments + ' experiments ' : ''}
          ${readyForDeletion.models > 0 ? readyForDeletion.models + ' models ' : ''} in this project. <br/>
          If you wish to delete this project, you must archive, delete, or move these items to another project.`
}

export function readyForDeletionFilter(readyForDeletion) {
 return !(readyForDeletion.experiments === null || readyForDeletion.models === null);
}
