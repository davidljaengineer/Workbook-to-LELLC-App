
import React, { useMemo, useState } from 'react';
import { useProject } from '../../hooks/useProject';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { produce } from 'immer';

export const CollectorStreetModule: React.FC = () => {
    const { activeProject, updateProject } = useProject();
    const [streetOption, setStreetOption] = useState<'half' | 'full'>('half');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        const updatedProject = produce(activeProject!, draft => {
            (draft.collectorStreet as any)[id] = parseFloat(value) || 0;
        });
        updateProject(updatedProject);
    };

    const handleSurfaceChange = (index: number, field: 'width' | 'cValue', value: string) => {
        const updatedProject = produce(activeProject!, draft => {
            draft.collectorStreet.surfaces[index][field] = parseFloat(value) || 0;
        });
        updateProject(updatedProject);
    };

    const results = useMemo(() => {
        if (!activeProject) return { weightedC: 0 };
        const { surfaces } = activeProject.collectorStreet;
        
        let effectiveSurfaces = surfaces.filter(s => s.name !== 'Median');
        if(streetOption === 'full' && surfaces.some(s => s.name === 'Median' && s.width > 0)) {
            effectiveSurfaces = surfaces;
        }

        const totalWidth = effectiveSurfaces.reduce((sum, s) => sum + s.width, 0);
        if (totalWidth === 0) return { weightedC: 0 };

        const weightedSum = effectiveSurfaces.reduce((sum, s) => sum + s.width * s.cValue, 0);
        const weightedC = weightedSum / totalWidth;

        return { weightedC };
    }, [activeProject, streetOption]);

    if (!activeProject) return <div className="text-center p-8">Please select a project to begin.</div>;

    const data = activeProject.collectorStreet;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card title="Collector Street Section Inputs">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input id="rwWidth" label="Right-of-Way Width" type="number" value={data.rwWidth} onChange={handleInputChange} unit="ft" />
                        <Input id="streetWidth" label="Street Width" type="number" value={data.streetWidth} onChange={handleInputChange} unit="ft" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input id="curbWidth" label="Curb & Gutter Width" type="number" value={data.curbWidth} onChange={handleInputChange} unit="ft" />
                        <Input id="sidewalkWidth" label="Sidewalk Width" type="number" value={data.sidewalkWidth} onChange={handleInputChange} unit="ft" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input id="parkwayWidth" label="Landscape Parkway Width" type="number" value={data.parkwayWidth} onChange={handleInputChange} unit="ft" />
                        <Input id="medianWidth" label="Median Width" type="number" value={data.medianWidth} onChange={handleInputChange} unit="ft" />
                    </div>

                    <h4 className="text-lg font-semibold pt-4 border-t border-slate-200 dark:border-slate-700">Surface Properties (Half-Street)</h4>
                    {data.surfaces.map((surface, index) => (
                        <div key={surface.name} className="grid grid-cols-3 items-end gap-4">
                            <label className="font-medium text-sm pt-4">{surface.name}</label>
                             <input type="number" value={surface.width} onChange={e => handleSurfaceChange(index, 'width', e.target.value)} className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="Width (ft)" />
                             <input type="number" value={surface.cValue} onChange={e => handleSurfaceChange(index, 'cValue', e.target.value)} className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="C Value" />
                        </div>
                    ))}
                </div>
            </Card>

            <div className="space-y-8">
                <Card title="Calculation Options">
                    <div className="flex space-x-4">
                        <label className="flex items-center">
                            <input type="radio" name="street-option" value="half" checked={streetOption === 'half'} onChange={() => setStreetOption('half')} className="form-radio h-4 w-4 text-blue-600" />
                            <span className="ml-2 text-sm">Half-Street</span>
                        </label>
                        <label className="flex items-center">
                            <input type="radio" name="street-option" value="full" checked={streetOption === 'full'} onChange={() => setStreetOption('full')} className="form-radio h-4 w-4 text-blue-600" />
                            <span className="ml-2 text-sm">Full-Street</span>
                        </label>
                    </div>
                </Card>
                <Card title="Results">
                    <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                        <span className="font-medium">Weighted C:</span>
                        <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{results.weightedC.toFixed(3)}</span>
                    </div>
                </Card>
            </div>
        </div>
    );
};
