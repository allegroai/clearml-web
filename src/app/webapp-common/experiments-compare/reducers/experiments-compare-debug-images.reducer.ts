export interface IExperimentCompareDebugImagesState {
  bla: string;
}

export const initialState: IExperimentCompareDebugImagesState = {
  bla: null,
};


export function experimentsCompareDebugImagesReducer(state: IExperimentCompareDebugImagesState = initialState, action): IExperimentCompareDebugImagesState {
  switch (action.type) {
    // case SET_EXPERIMENT:
    //   return { ...state, selectedExperiment: action.payload };
    default:
      return state;
  }
}
