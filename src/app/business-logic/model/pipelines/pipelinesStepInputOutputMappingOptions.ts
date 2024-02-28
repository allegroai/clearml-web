import { Artifact } from "../tasks/artifact";

export interface PipelinesStepInputOutputMappingOptions extends Artifact {
    stepName: string;
}