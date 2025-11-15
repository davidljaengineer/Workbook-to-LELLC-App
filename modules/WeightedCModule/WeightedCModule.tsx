import React from 'react';
import { useProject } from '../../hooks/useProject';
import { Card } from '../../components/common/Card';
import { Subbasin } from '../../types';
import { produce } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import { exportToCSV } from '../../lib/utils';
import { Input } from '../../components/common/Input';

export const WeightedCModule: React.FC = () => {
    const { activeProject, updateProject } = useProject();

    if (!activeProject) return <div className="text-center p-8">Please select a project to begin.</div>;

    const { weightedC } = activeProject;

    const handleLandUseChange = (index: number, value: string) => {
        const updatedProject = produce(activeProject, draft => {
            draft.weightedC.landUses[index].c10 = parseFloat(value) || 0;
        });
        updateProject(updatedProject);
    };

    const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        const updatedProject = produce(activeProject!, draft => {
            (draft.weightedC as any)[id] = parseFloat(value) || 0;
        });
        updateProject(updatedProject);
    };

    const handleSubbasinChange = (subbasinIndex: number, field: keyof Subbasin | 'percentage', value: string, landUseName?: string) => {
        const updatedProject = produce(activeProject, draft => {
            if (field === 'percentage' && landUseName) {
                draft.weightedC.subbasins[subbasinIndex].percentages[landUseName] = parseFloat(value) || 0;
            } else if (field !== 'percentage') {
                (draft.weightedC.subbasins[subbasinIndex] as any)[field] = field === 'area' ? parseFloat(value) : value;
            }
        });
        updateProject(updatedProject);
    };

    const addSubbasin = () => {
        const newSubbasin: Subbasin = {
            id: `New-${(weightedC.subbasins.length + 1)}`,
            area: 0,
            percentages: weightedC.landUses.reduce((acc, lu) => ({ ...acc, [lu.name]: 0 }), {})
        };
        const updatedProject = produce(activeProject, draft => {
            draft.weightedC.subbasins.push(newSubbasin);
        });
        updateProject(updatedProject);
    };

    const removeSubbasin = (subbasinIndex: number) => {
        const updatedProject = produce(activeProject, draft => {
            draft.weightedC.subbasins.splice(subbasinIndex, 1);
        });
        updateProject(updatedProject);
    };

    const calculatedResults = weightedC.subbasins.map(subbasin => {
        // FIX: Operator '+' cannot be applied to types 'unknown' and 'number'.
        // The value `p` is inferred as `unknown` from `Object.values`, so we convert it to a number.
        // By explicitly setting the generic for reduce, we ensure percentageSum is typed as a number.
        const percentageSum = Object.values(subbasin.percentages).reduce<number>((sum, p) => sum + Number(p), 0);
        
        const c10 = weightedC.landUses.reduce((sum, lu) => {
            const percentage = subbasin.percentages[lu.name] || 0;
            return sum + (percentage / 100) * lu.c10;
        }, 0);

        const c100 = Math.min(c10 * weightedC.c100Multiplier, weightedC.c100Cap);

        return {
            ...subbasin,
            c10,
            c100,
            percentageSum: Math.round(percentageSum)
        };
    });

    const handleExport = () => {
        const headers = ["Subbasin ID", "Area (acres)", ...weightedC.landUses.map(lu => `${lu.name} (%)`), "C10", "C100"];
        const data = calculatedResults.map(res => ([
            res.id,
            res.area,
            ...weightedC.landUses.map(lu => res.percentages[lu.name] || 0),
            res.c10.toFixed(3),
            res.c100.toFixed(3)
        ]));
        exportToCSV(headers, data, `${activeProject.metadata.name}_WeightedC_Export`);
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card title="Land Use C10 Coefficients">
                    <div className="space-y-2">
                        {weightedC.landUses.map((lu, index) => (
                            <div key={lu.name} className="flex items-center justify-between">
                                <label className="text-sm font-medium">{lu.name}</label>
                                <input type="number" value={lu.c10} onChange={e => handleLandUseChange(index, e.target.value)} className="w-24 bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                            </div>
                        ))}
                    </div>
                </Card>
                 <Card title="C-Value Configuration">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input id="c100Multiplier" label="C100 Multiplier" type="number" value={weightedC.c100Multiplier} onChange={handleConfigChange} />
                        <Input id="c100Cap" label="C100 Cap" type="number" value={weightedC.c100Cap} onChange={handleConfigChange} />
                    </div>
                </Card>
            </div>

            <Card title="Subbasin Weighted C">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-3 py-3 text-left text-xs font-medium uppercase">Subbasin ID</th>
                                <th className="px-3 py-3 text-left text-xs font-medium uppercase">Area (acres)</th>
                                {weightedC.landUses.map(lu => <th key={lu.name} className="px-3 py-3 text-left text-xs font-medium uppercase">{lu.name} (%)</th>)}
                                <th className="px-3 py-3 text-left text-xs font-medium uppercase">C10</th>
                                <th className="px-3 py-3 text-left text-xs font-medium uppercase">C100</th>
                                <th className="px-3 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {calculatedResults.map((res, index) => (
                                <tr key={index}>
                                    <td className="px-3 py-2"><input type="text" value={res.id} onChange={e => handleSubbasinChange(index, 'id', e.target.value)} className="w-20 p-1.5 text-sm dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded" /></td>
                                    <td className="px-3 py-2"><input type="number" value={res.area} onChange={e => handleSubbasinChange(index, 'area', e.target.value)} className="w-20 p-1.5 text-sm dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded" /></td>
                                    {weightedC.landUses.map(lu => (
                                        <td key={lu.name} className="px-3 py-2"><input type="number" value={res.percentages[lu.name] || 0} onChange={e => handleSubbasinChange(index, 'percentage', e.target.value, lu.name)} className="w-20 p-1.5 text-sm dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded" /></td>
                                    ))}
                                    <td className={`px-3 py-2 font-medium ${res.percentageSum !== 100 ? 'text-yellow-500' : ''}`}>{res.c10.toFixed(3)}</td>
                                    <td className="px-3 py-2 font-medium">{res.c100.toFixed(3)}</td>
                                    <td className="px-3 py-2">
                                        <button onClick={() => removeSubbasin(index)} className="text-red-500 hover:text-red-700">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex justify-between">
                    <button onClick={addSubbasin} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Add Subbasin</button>
                    <button onClick={handleExport} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">Export to CSV</button>
                </div>
            </Card>
        </div>
    );
};