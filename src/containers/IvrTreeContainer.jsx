import React, { useState, useEffect, useLayoutEffect, Fragment } from "react";
import dagre from "dagre";
import { Modal, Button, Form, Input, Select, Popconfirm } from "antd";
import { EditOutlined } from "@ant-design/icons";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  MiniMap,
  Background,
  Controls,
} from "react-flow-renderer";
import "./styles.less";
import Request from "../request.js";
import { useSelector, useDispatch } from "react-redux";

// Implimentation of Darge Tree ::--

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 300;
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

const NodeFrame = ({ index, delNodes, currentNode, addNode, getData }) => {
  const [actionFieldType, setActionFieldType] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const ActionField = (e) => {
    if (e !== "IVR") {
      setActionFieldType(false);
    } else {
      setActionFieldType(true);
    }
  };

  const filterTrigerDigit = (S_Node) => {
    console.log(S_Node);
  };

  const editNode = (node) => {
    setIsEditModalVisible(true);
    setSelectedNode(() => node);
  };

  const handleCancel = () => {
    setIsEditModalVisible(false);
  };

  const editfinish = async (values) => {
    await Request.updateNode(
      values?.triggerDigit,
      values?.actionType,
      values?.action,
      selectedNode.id
    );
    getData();
    setIsEditModalVisible(false);
  };
  const confirm = () => {
    delNodes(currentNode?.id);
  };

  return (
    <Fragment key={index}>
      <Popconfirm title="Delete this node." onConfirm={confirm}>
        <div className="deleteNode">+</div>
      </Popconfirm>
      <EditOutlined
        style={{
          fontSize: "25px",
          padding: "5px",
          cursor: "pointer",
          border: "3px solid #293275",
          borderRadius: "50px",
          background: "#fff",
          position: "absolute",
          top: "-18px",
          left: "-18px",
        }}
        onClick={() => {
          editNode(currentNode);
        }}
      />
      <h1 className="trigarDigit">{currentNode?.trigger_digit}</h1>
      <hr />
      <h2>{currentNode?.action_type}</h2>
      <hr />
      <p>{currentNode?.action}</p>
      <hr />
      <div
        className="nodeBtn"
        onClick={() => {
          addNode(currentNode);
          filterTrigerDigit(currentNode);
        }}
      >
        +
      </div>
      <Modal
        title="Create Node"
        visible={isEditModalVisible}
        footer={null}
        onCancel={handleCancel}
      >
        <Form {...layout} name="IVR Tree" onFinish={editfinish}>
          <Form.Item
            initialValue={selectedNode?.trigger_digit}
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
            initialValue={selectedNode?.action_type}
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
            initialValue={selectedNode?.action}
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
    </Fragment>
  );
};

function IvrTreeContainer() {
  // States ::--
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [actionFieldType, setActionFieldType] = useState(false);

  // Defining Nodes and Edges ::--

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const dispatch = useDispatch();
  // API ReduestsAndEdges::
  const delNodes = async (id) => {
    await Request.deleteNode(id);
    getData();
  };

  const getData = async () => {
    const newNodes = await Request.getNodes();
    dispatch({ type: "storeNodes", payload: newNodes });
    const newEdges = await Request.getEdges();
    dispatch({ type: "storeEdges", payload: newEdges });
    if (newNodes && newEdges) {
      if (newNodes[0] === undefined) {
        setIsModalVisible(true);
      }
      // setTargetId(newNodes[newNodes.length - 1].id + 1);
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
                  getData={getData}
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
                getData={getData}
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

  useLayoutEffect(() => {
    getLayoutedElements(nodes, edges);
  }, [nodes, edges]);

  useEffect(() => {
    getData();
  }, []);

  const createNewNode = async (values) => {
    if (nodes[0] !== undefined) {
      const lastCreatedNode = await Request.createNode(
        values?.triggerDigit,
        values?.actionType,
        values?.action
      );
      const e_id = `${selectedNode?.id}-${lastCreatedNode.id}`;
      await Request.createEdge(e_id, +selectedNode?.id, lastCreatedNode.id);
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
