import React, { useState, useEffect, Fragment } from "react";
import dagre from "dagre";
import { Modal, Button, Form, Input, Select } from "antd";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  MiniMap,
  Background,
  Controls,
} from "react-flow-renderer";
import "./styles.less";

// Implimentation of Darge Tree ::--

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 250;
const nodeHeight = 200;

const getLayoutedElements = (nodes, edges) => {
  dagreGraph.setGraph({});

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

// Defining Veriables ::--
const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};

const triggerDigitOptions = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "*",
  "#",
];

const actionTypeOptions = [
  "IVR",
  "Department Queue",
  "Voice Mail",
  "After Hours",
  "Direct Extention",
  "Command",
  "Redirect to Number",
];

const actionIvrOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

let id = 0;

let position = {
  x: 0,
  y: 0,
};

function IvrTreeContainer() {
  const initialNodes = [];
  const initialEdges = [];
  // Defining Nodes and Edges ::--
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    getLayoutedElements(nodes, edges);
  }, [nodes, edges]);

  // const onConnect = useCallback(
  //   (params) =>
  //     setEdges((eds) =>
  //       addEdge(
  //         { ...params, type: ConnectionLineType.SmoothStep, animated: true },
  //         eds
  //       )
  //     ),
  //   []
  // );

  //
  // useEffects ::--
  useEffect(() => {
    if (nodes[0] === undefined) {
      setIsModalVisible(true);
    }
  }, []);

  // States ::--
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [actionFieldType, setActionFieldType] = useState(false);
  // Defining Functions ::--
  const onFinish = (values) => {
    if (nodes[0] === undefined) {
      setNodes([
        ...nodes,
        {
          id: id.toString(),
          type: "input",
          data: {
            label: (
              <Fragment>
                <h1>{values?.triggerDigit}</h1>
                <hr />
                <h2>{values?.actionType}</h2>
                <hr />
                <p>{values?.action}</p>
              </Fragment>
            ),
          },
          position,
        },
      ]);
    } else {
      setNodes([
        ...nodes,
        {
          id: id.toString(),
          data: {
            label: (
              <Fragment>
                <h1>{values?.triggerDigit}</h1>
                <hr />
                <h2>{values?.actionType}</h2>
                <hr />
                <p>{values?.action}</p>
              </Fragment>
            ),
          },
          position,
        },
      ]);
      setEdges([
        ...edges,
        {
          id: selectedNode?.id + "-" + id.toString(),
          source: selectedNode?.id,
          target: id.toString(),
          animated: true,
        },
      ]);
    }
    setIsModalVisible(false);
    id += 1;
  };

  const ActionField = (e) => {
    if (e !== "IVR") {
      setActionFieldType(false);
    } else {
      setActionFieldType(true);
    }
  };

  // const onConnect = useCallback(
  //   (params) => setEdges((els) => addEdge(params, els)),
  //   [setEdges]
  // );

  const addNode = (event, node) => {
    setIsModalVisible(true);
    setSelectedNode(() => node);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div id="tree-layout-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        minZoom = {0}
        // onConnect={onConnect}
        zoomOnDoubleClick={false}
        fitView={true}
        onlyRenderVisibleElements={true}
        snapGrid={[40, 40]}
        snapToGrid={true}
        attributionPosition="bottom-left"
        className="touchdevice-flow"
        onNodeDoubleClick={addNode}
        defaultEdgeOptions={{
          animated: true,
        }}
      >
        <Controls />
        <MiniMap
          nodeColor="rgba(0, 21, 41, 0.1)"
          nodeStrokeColor="#001529"
          nodeStrokeWidth={3}
          maskColor="rgba(0, 21, 41, 0.4)"
        />
        <Background gap={30} />
      </ReactFlow>
      <Modal
        title="Create Node"
        visible={isModalVisible}
        footer={null}
        onCancel={handleCancel}
      >
        <Form {...layout} name="IVR Tree" onFinish={onFinish}>
          <Form.Item
            name={"triggerDigit"}
            label="Trigger Digit"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select>
              {triggerDigitOptions.map((triggerDigitOption, index) => {
                return (
                  <Select.Option value={triggerDigitOption} key={index}>
                    {triggerDigitOption}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item
            name={"actionType"}
            label="Action Type"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select onChange={ActionField}>
              {actionTypeOptions.map((actionTypeOptions, index) => {
                return (
                  <Select.Option value={actionTypeOptions} key={index}>
                    {actionTypeOptions}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item
            name={"action"}
            label="Action"
            rules={[
              {
                required: true,
              },
            ]}
          >
            {actionFieldType ? (
              <Select>
                {actionIvrOptions.map((actionIvrOptions, index) => {
                  return (
                    <Select.Option value={actionIvrOptions} key={index}>
                      {actionIvrOptions}
                    </Select.Option>
                  );
                })}
              </Select>
            ) : (
              <Input />
            )}
          </Form.Item>
          <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default IvrTreeContainer;
