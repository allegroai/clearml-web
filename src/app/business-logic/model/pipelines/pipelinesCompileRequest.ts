
export interface PipelinesCompileRequest {
    pipeline_id?: string;
    steps?: Array<{nodeName:string}>;
    connections?: Array<{startNodeName:string, endNodeName: string}>;
}
