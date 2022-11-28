export abstract class FormsTrackBy {
  private lengthChanged: boolean;
  private previousLength: number;

  abstract formData;

  trackByFn = (index, val) => {
    if ((this.lengthChanged === true) && (index === this.formData.length - 1)) {
      this.previousLength = this.formData.length;
      this.lengthChanged  = false;
      return val;
    }
    if (this.previousLength > this.formData.length) {
      this.lengthChanged = true;
      return val;

    }
    if (index === this.formData.length - 1) {
      this.previousLength = this.formData.length;
    }
    return index;
  };
}

export const trackByIndex = (index: number): number => index;
export const trackById = (index: number, val) => val.id;
export const trackByKey = (index: number, item: {key: string; value: any}) => item.key;
export const trackByValue = (index: number, option: {value: any; label: string}) => option.value;
