import React, { useState, useEffect, useLayoutEffect, Fragment } from "react";
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

import Request from "../request.js";

// Implimentation of Darge Tree ::--

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 250;
const nodeHeight = 200;

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

let position = {
  x: 0,
  y: 0,
};

const NodeFrame = ({ index, delNodes, currentNode, addNode }) => {
  return (
    <Fragment key={index}>
      <div
        className="deleteNode"
        onClick={() => {
          delNodes(currentNode?.id);
          console.log(`${currentNode?.id} node Deleted`);
        }}
      >
        +
      </div>
      <h1>{currentNode?.trigger_digit}</h1>
      <hr />
      <h2>{currentNode?.action_type}</h2>
      <hr />
      <p>{currentNode?.action}</p>
      <hr />
      <div
        className="nodeBtn"
        onClick={() => {
          addNode(currentNode);
        }}
      >
        +
      </div>
    </Fragment>
  );
};

function IvrTreeContainer() {
  // States ::--
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [actionFieldType, setActionFieldType] = useState(false);
  const [targetId, setTargetId] = useState(null);

  // Defining Nodes and Edges ::--

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // API Reduests::
  const delNodes = async (id) => {
    await Request.deleteNode(id);
    getData();
  };

  const getData = async () => {
    const newNodes = await Request.getNodes();
    const newEdges = await Request.getEdges();
    if (newNodes && newEdges) {
      if (newNodes[0] === undefined) {
        return setIsModalVisible(true);
      }
      setTargetId(newNodes[newNodes.length - 1].id + 1);
      const newNodeArr = newNodes.map((currentNode, index) => {
        if (index === 0) {
          return {
            id: currentNode?.id.toString(),
            type: "input",
            data: {
              label: (
                <NodeFrame
                  index={index}
                  delNodes={delNodes}
                  currentNode={currentNode}
                  addNode={addNode}
                />
              ),
            },
            position,
          };
        }
        return {
          id: currentNode?.id.toString(),
          data: {
            label: (
              <NodeFrame
                index={index}
                delNodes={delNodes}
                currentNode={currentNode}
                addNode={addNode}
              />
            ),
          },
          position,
        };
      });
      setNodes(newNodeArr);
      const newEdgeArr = newEdges.map((currentNode) => {
        return {
          id: currentNode?.e_id,
          source: currentNode?.source.toString(),
          type: "smoothstep",
          target: currentNode?.target.toString(),
          animated: true,
        };
      });
      setEdges(newEdgeArr);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const createNewNode = async (values) => {
    if (nodes[0] !== undefined) {
      await Request.createNode(
        values?.triggerDigit,
        values?.actionType,
        values?.action
      );
      const e_id = `${selectedNode?.id}-${targetId}`;
      await Request.createEdge(e_id, +selectedNode?.id, targetId);
      getData();
    } else {
      await Request.createNode(
        values?.triggerDigit,
        values?.actionType,
        values?.action
      );
      getData();
    }
    setIsModalVisible(false);
  };

  const onFinish = (values) => {
    createNewNode(values);
  };

  const ActionField = (e) => {
    if (e !== "IVR") {
      setActionFieldType(false);
    } else {
      setActionFieldType(true);
    }
  };

  const addNode = (node) => {
    setIsModalVisible(true);
    setSelectedNode(() => node);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

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

  useLayoutEffect(() => {
    getLayoutedElements(nodes, edges);
  }, [nodes, edges]);

  return (
    <div id="tree-layout-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        minZoom={0.6}
        zoomOnDoubleClick={false}
        fitView={true}
        onlyRenderVisibleElements={true}
        attributionPosition="bottom-left"
        className="touchdevice-flow"
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
