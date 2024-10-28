'use client'

import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

type DiffResult = {
    added: string[];
    removed: string[];
    modified: string[];
    unchanged: string[];
};

export default function Compare({
    obj1,
    obj2,
    onDifferencesCalculated,
    hideSummary = false,
    hideUnchanged = false,
}: {
    obj1: Record<string, any>,
    obj2: Record<string, any>,
    onDifferencesCalculated?: (differences: DiffResult) => void,
    hideSummary?: boolean,
    hideUnchanged?: boolean
}) {
    const compareObjects = (a: Record<string, any>, b: Record<string, any>): DiffResult => {
        const allKeys = [...new Set([...Object.keys(a), ...Object.keys(b)])];

        return allKeys.reduce((acc: DiffResult, key: string) => {
            const inFirst = key in a;
            const inSecond = key in b;

            if (!inFirst) {
                acc.added.push(key);
            } else if (!inSecond) {
                acc.removed.push(key);
            } else if (a[key] !== b[key]) {
                acc.modified.push(key);
            } else {
                acc.unchanged.push(key);
            }

            return acc;
        }, { added: [], removed: [], modified: [], unchanged: [] });
    };

    const differences = compareObjects(obj1, obj2);

    // Call the callback when differences are calculated
    React.useEffect(() => {
        onDifferencesCalculated?.(differences);
    }, [differences, onDifferencesCalculated]);

    const formatValue = (value: any): string => {
        if (value === undefined) return 'undefined';
        return typeof value === 'string' ? `"${value}"` : String(value);
    };

    const renderDiffSection = (title: string, keys: string[], color: string) => (
        keys.length > 0 && (
            <div className="mb-4">
                {/* <h3 className="text-lg font-semibold mb-2">{title}</h3> */}
                <ul className="space-y-1">
                    {keys.map(key => (
                        <li key={key} className="flex items-center space-x-2">
                            <Badge className={color}>{title.split(' ')[0]}</Badge>
                            <span className="font-mono">
                                {key}: {formatValue(obj1[key])}
                                {title === 'Modified' && ` → ${formatValue(obj2[key])}`}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        )
    );

    return (
        !hideSummary && !hideUnchanged && (
            <Card >

                <CardContent >
                    <ScrollArea className="h-full w-full rounded-md p-1">
                        {renderDiffSection('Added', differences.added, 'bg-green-500')}
                        {renderDiffSection('Removed', differences.removed, 'bg-red-500')}
                        {renderDiffSection('Modified', differences.modified, 'bg-orange-500')}
                        {renderDiffSection('Unchanged Keys', differences.unchanged, 'bg-gray-500')}

                        <div className="mt-4">
                            <h3 className="text-lg font-semibold mb-2">Summary</h3>
                            <ul className="list-disc list-inside">
                                <li>Added: {differences.added.length} keys</li>
                                <li>Removed: {differences.removed.length} keys</li>
                                <li>Modified: {differences.modified.length} keys</li>
                                <li>Unchanged: {differences.unchanged.length} keys</li>
                            </ul>
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        )
        || (hideSummary && (
            <div>
            {renderDiffSection('Modified', differences.modified, 'bg-orange-500')}
            </div>
        ))
    

    )
}
