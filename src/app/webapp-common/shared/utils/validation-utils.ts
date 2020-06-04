// TODO: (nir) need refactor to final validation solution
export function validateName(name: string) {
  if (name.trim().length < 3) {
    return false;
  }
  return true;
}

export function validateNotEmptyArray(arr: Array<any>) {
  if (arr && arr.length > 0) {
    return true;
  }
  return false;
}

export function validateProject(projectId: string) {
  if (projectId && projectId !== '*') {
    return true;
  } else {
    return false;
  }
}



export function areErrors(errors) {
  return Object.values(errors).find((property: any) => !property.valid);
}


export function validateJson(obj) {
  try {
    JSON.parse(obj);
  } catch (e) {
    return {json: false};
  }
  return null;
}
