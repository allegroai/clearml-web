import * as React from "react";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  updateEdge,
  BackgroundVariant,
} from "reactflow";
import PipelineStepComponent from "./pipeline-step.component";

export interface IMyComponentProps {
  initialNodes: any;
  initialEdges: any;
  onNodesDataChanged: Function,
  onEdgesDataChanged: Function,
  onNodeClicked: Function
}

const edgeOptions = {
  animated: true,
  style: {
    stroke: "#B0B0B0",
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "#B0B0B0",
    strokeWidth: 2,
  },
};
const connectionLineStyle = { stroke: "#B0B0B0" };

export const PipelineFlowComponent: FunctionComponent<IMyComponentProps> = (
  props: IMyComponentProps
) => {
  // const timerHandle = useRef<number | null>(null);
  // const [stateCounter, setStateCounter] = useState(42);

  const [nodes, setNodes, onNodesChange] = useNodesState(props.initialNodes?.length ? props.initialNodes : []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(props.initialEdges?.length? props.initialEdges: []);
  const edgeUpdateSuccessful = useRef(true);

  React.useEffect(() => {
    props.onNodesDataChanged(nodes);
  }, [nodes]);
  React.useEffect(() => {
    props.onEdgesDataChanged(edges)
  }, [edges])
 

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  /**
   * @function onEdgeUpdateEnd
   * @description  this function is triggger when edge is connected to other node.
   */
  const onEdgeUpdateEnd = useCallback((_a, edge) => {
    if (!edgeUpdateSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }
    edgeUpdateSuccessful.current = true;
  }, []);

  /**
   * @function onEdgeUpdateStart
   * @description  this function is trigger when we will start updating of Edge
   */
  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  /**
   * @function onEdgeUpdate
   * @description  this function is trigger when Edge will updated.
   */
  const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
    edgeUpdateSuccessful.current = true;
    setEdges((els) => updateEdge(oldEdge, newConnection, els));
  }, []);

  /**
   * @function onNodeClick
   * @description  to update node Data
   */
  const onNodeClick = (_event, node) => {
    //setIsShowNodeEditModal(true);
    // setNodeData(clone(node));
    props.onNodeClicked(node);
  };

  const onPaneClick = () => {
    // setIsShowNodeEditModal(false);
  };

  const nodeTypes = React.useMemo(
    () => ({
      normal: PipelineStepComponent,
    }),
    ["NormalOperationPipelineNode"]
  );

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 130px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        defaultEdgeOptions={edgeOptions}
        onEdgesChange={onEdgesChange}
        onEdgeUpdateEnd={onEdgeUpdateEnd}
        onEdgeUpdateStart={onEdgeUpdateStart}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        maxZoom={1}
        onConnect={onConnect}
        onEdgeUpdate={onEdgeUpdate}
        fitView
        /* style={{
                 backgroundColor: "#1a1e2c"
              }} */
        connectionLineStyle={connectionLineStyle}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
      >
        {/* <Background variant={BackgroundVariant.Lines} gap={20} size={0.4} /> */}
       {/*  <MiniMap nodeStrokeWidth={3} /> */}
        <Controls />
      </ReactFlow>
      {/* <ReactFlow  nodes={nodes}
        edges={edges}  onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}>
  <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
    </ReactFlow> */}
    </div>
  );
};
