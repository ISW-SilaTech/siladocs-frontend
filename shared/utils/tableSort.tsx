import { useState, useMemo } from 'react';

export type SortDir = 'asc' | 'desc';

export function useTableSort<T extends object>(items: T[]) {
    const [sortKey, setSortKey] = useState<keyof T | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    const toggle = (key: keyof T) => {
        setSortKey(prev => {
            if (prev === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
            else setSortDir('asc');
            return key;
        });
    };

    const sorted = useMemo(() => {
        if (!sortKey) return items;
        return [...items].sort((a, b) => {
            const av = a[sortKey];
            const bv = b[sortKey];
            if (av == null && bv == null) return 0;
            if (av == null) return 1;
            if (bv == null) return -1;
            const cmp = typeof av === 'number' && typeof bv === 'number'
                ? av - bv
                : String(av).localeCompare(String(bv), 'es', { numeric: true, sensitivity: 'base' });
            return sortDir === 'asc' ? cmp : -cmp;
        });
    }, [items, sortKey, sortDir]);

    return { sorted, sortKey, sortDir, toggle };
}

interface ThProps {
    label: string;
    field: string;
    sortKey: string | null;
    sortDir: SortDir;
    onSort: (key: string) => void;
}

export function SortTh({ label, field, sortKey, sortDir, onSort }: ThProps) {
    const active = sortKey === field;
    return (
        <span
            role="button"
            onClick={() => onSort(field)}
            style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
            {label}
            <span style={{ fontSize: '0.7em', opacity: active ? 1 : 0.35, lineHeight: 1 }}>
                {active ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
            </span>
        </span>
    );
}
