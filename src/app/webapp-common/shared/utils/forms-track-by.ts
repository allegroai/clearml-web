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
export const trackById = <T extends {id: number | string}>(index: number, val: T): number | string => val.id;
