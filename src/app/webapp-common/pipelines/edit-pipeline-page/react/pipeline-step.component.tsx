import React from "react";
import { Handle, Position } from 'reactflow';
/* import "./pipeline-step.css" */

export default function PipelineStepComponent({ data }) {
  return (
    <div className="" style={{
        padding: "2px",
        borderRadius: "4px",
        background: "#1A1E2C",
        color: "#f2f4fc",
        width: "198px"
    }}>
      <div className="step-part step-title queued" style={{
            borderRadius: "4px 4px 0 0",
            height: "48px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "2px 12px",
            background: "#1A1E2C"
      }}>
         <i
          className="al-icon sm-md al-ico-console"
          data-id="stepResultButton"
        ></i>
        {/*  <sm-experiment-type-icon-label [type]="step.data?.job_type" [showLabel]="false"></sm-experiment-type-icon-label> */}
        <div className="title" style={{
                flex: 1,
                maxWidth: "108px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
            }
        }>{data.name} test name</div>
       
      </div>
      <div className="step-part step-footer queued" style={{
        background: "#424A68",
        borderRadius: "0 0 4px 4px",
    justifyContent: "space-between",
    height: "26px"
      }}>
        {/*  <i *ngIf="step.data.status !== 'pending'" class="al-icon sm-md" [class]="'al-ico-status-' + step.data.status" data-id="stepStatusIcon"></i> */}
        {/* <div *ngIf="step?.data?.job_started">
      {{runTime | duration}}
    </div> */}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="b"
        style={{ bottom: 20, top: 'auto', background: '#B0B0B0' }}
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="b"
        style={{ bottom: 20, top: 'auto', background: '#B0B0B0' }}
        isConnectable={true}
      />
    </div>
  );
}
