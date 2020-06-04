export interface TreeNode {
  label?: string;
  data?: any;
  children?: TreeNode[];
  parent?: TreeNode;
}

export const buildVersionsTree = function(versions: any = []): TreeNode[] {
    const nodes = [];
    const nodeMap = Object.create(null);

    versions.forEach(node => {
      nodeMap[node.id] = {'data': node, label: node.name, children: [], expanded: true};
    });

    versions.forEach(node => {
      if (node.parent) {
        nodeMap[node.parent] && nodeMap[node.parent].children.push(nodeMap[node.id]);
      } else {
        nodes.push(nodeMap[node.id]);
      }
    });

    return nodes;
};
