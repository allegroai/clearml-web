export const download = (data: string, exportName: string) => {
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', data);
  downloadAnchorNode.setAttribute('download', exportName);
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

