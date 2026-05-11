import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';

export default function TaintGraph({ flowGraph }) {
    const { nodes: initialNodes, edges: initialEdges } = flowGraph;

    // Автоматически выстраиваем узлы сверху вниз
    const nodes = useMemo(() => initialNodes.map((n, index) => {
        // Цветовое кодирование: Источник (Оранжевый), Шаг (Синий), Сток/Критикал (Красный)
        let bgColor = '#3b82f6'; // blue
        if (n.nodeType === 'Source') bgColor = '#f59e0b'; // amber
        if (n.nodeType === 'Sink') bgColor = '#ef4444'; // red

        return {
            id: n.nodeId,
            position: { x: 250, y: index * 120 }, // Расставляем по вертикали
            data: {
                label: (
                    <div className="flex flex-col items-center p-2">
                        <span className="text-xs font-bold uppercase tracking-wider mb-1 opacity-80">{n.nodeType}</span>
                        <code className="bg-black/20 px-2 py-1 rounded text-sm whitespace-pre-wrap text-center">
                            {n.codeContext}
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

    const edges = useMemo(() => initialEdges.map((e, idx) => ({
        id: `e${e.fromId}-${e.toId}-${idx}`,
        source: e.fromId,
        target: e.toId,
        animated: true, // Анимация потока данных!
        style: { stroke: '#94a3b8', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
    })), [initialEdges]);

    return (
        <div className="h-[400px] w-full border border-slate-700 rounded-xl bg-slate-900 overflow-hidden">
            <ReactFlow nodes={nodes} edges={edges} fitView>
                <Background color="#334155" gap={16} />
                <Controls className="bg-slate-800 border-slate-700 fill-white" />
            </ReactFlow>
        </div>
    );
}