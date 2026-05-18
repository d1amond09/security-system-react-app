import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';

export default function TaintGraph({ flowGraph }) {
    // 1. Проверка на существование объекта графа
    if (!flowGraph) return null;

    // 2. Гибкое извлечение узлов и ребер (поддержка nodes/Nodes и edges/Edges)
    const initialNodes = flowGraph.nodes || flowGraph.Nodes || [];
    const initialEdges = flowGraph.edges || flowGraph.Edges || [];

    // 3. Если данных нет, возвращаем заглушку
    if (!Array.isArray(initialNodes) || initialNodes.length === 0) {
        return <div className="text-slate-500 italic p-4 border border-slate-700 rounded-xl bg-slate-900/50">Визуализация недоступна</div>;
    }

    const nodes = useMemo(() => initialNodes.map((n, index) => {
        // Поддержка разных вариантов написания свойств узла
        const nodeId = n.nodeId || n.NodeId;
        const nodeType = n.nodeType || n.NodeType || 'Step';
        const codeContext = n.codeContext || n.CodeContext || '';

        let bgColor = '#3b82f6'; // Step (Blue)
        if (nodeType === 'Source') bgColor = '#f59e0b'; // Source (Orange)
        if (nodeType === 'Sink') bgColor = '#ef4444';   // Sink (Red)

        return {
            id: String(nodeId),
            position: { x: 250, y: index * 120 },
            data: {
                label: (
                    <div className="flex flex-col items-center p-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80">{nodeType}</span>
                        <code className="bg-black/20 px-2 py-1 rounded text-[11px] whitespace-pre-wrap text-center font-mono leading-tight">
                            {codeContext}
                        </code>
                    </div>
                )
            },
            style: {
                background: bgColor,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                width: 300,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
            }
        };
    }), [initialNodes]);

    const edges = useMemo(() => initialEdges.map((e, idx) => {
        // Поддержка разных вариантов написания свойств ребра
        const fromId = e.fromId || e.FromId;
        const toId = e.toId || e.ToId;

        return {
            id: `e${fromId}-${toId}-${idx}`,
            source: String(fromId),
            target: String(toId),
            animated: true,
            style: { stroke: '#94a3b8', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
        };
    }), [initialEdges]);

    return (
        <div className="h-[400px] w-full border border-slate-700 rounded-xl bg-slate-950 overflow-hidden shadow-inner">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
            >
                <Background color="#334155" gap={16} />
                <Controls className="bg-slate-800 border-slate-700 fill-white" />
            </ReactFlow>
        </div>
    );
}