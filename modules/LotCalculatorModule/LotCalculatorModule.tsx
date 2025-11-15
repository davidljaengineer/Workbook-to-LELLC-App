
import React, { useMemo } from 'react';
import { useProject } from '../../hooks/useProject';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { produce } from 'immer';

export const LotCalculatorModule: React.FC = () => {
  const { activeProject, updateProject } = useProject();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const updatedProject = produce(activeProject!, draft => {
        (draft.lotCalculator as any)[id] = parseFloat(value) || 0;
    });
    updateProject(updatedProject);
  };
  
  const handleSurfaceChange = (index: number, field: 'coverage' | 'cValue', value: string) => {
    const updatedProject = produce(activeProject!, draft => {
        draft.lotCalculator.surfaces[index][field] = parseFloat(value) || 0;
    });
    updateProject(updatedProject);
  };

  const results = useMemo(() => {
    if (!activeProject) return { c10: 0, c100: 0, totalCoverage: 0 };
    const { surfaces, c100Multiplier, c100Cap } = activeProject.lotCalculator;
    
    const totalArea = surfaces.reduce((sum, s) => sum + s.coverage, 0);
    if(totalArea === 0) return { c10: 0, c100: 0, totalCoverage: 0 };
    
    const weightedSum = surfaces.reduce((sum, s) => sum + (s.coverage * s.cValue), 0);
    const c10 = weightedSum / totalArea;
    const c100 = Math.min(c10 * c100Multiplier, c100Cap);

    return { c10, c100, totalCoverage: totalArea };
  }, [activeProject]);

  if (!activeProject) return <div className="text-center p-8">Please select a project to begin.</div>;

  const data = activeProject.lotCalculator;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card title="Residential Lot (45' x 110') Inputs">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input id="lotWidth" label="Lot Width" type="number" value={data.lotWidth} onChange={handleInputChange} unit="ft" />
            <Input id="lotDepth" label="Lot Depth" type="number" value={data.lotDepth} onChange={handleInputChange} unit="ft" />
            <Input id="minLotArea" label="Min. Lot Area" type="number" value={data.minLotArea} onChange={handleInputChange} unit="sqft" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input id="frontYard" label="Front Setback" type="number" value={data.frontYard} onChange={handleInputChange} unit="ft" />
            <Input id="rearYard" label="Rear Setback" type="number" value={data.rearYard} onChange={handleInputChange} unit="ft" />
            <Input id="sideYard" label="Side Setback" type="number" value={data.sideYard} onChange={handleInputChange} unit="ft" />
          </div>
          <Input id="maxLotCoverage" label="Max Lot Coverage" type="number" value={data.maxLotCoverage} onChange={handleInputChange} unit="%" />
          
          <h4 className="text-lg font-semibold pt-4 border-t border-slate-200 dark:border-slate-700">Surface Properties</h4>
          {data.surfaces.map((surface, index) => (
            <div key={surface.name} className="grid grid-cols-3 items-end gap-4">
              <label className="font-medium text-sm pt-4">{surface.name}</label>
              <input type="number" value={surface.coverage} onChange={e => handleSurfaceChange(index, 'coverage', e.target.value)} className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="Coverage (%)" />
              <input type="number" value={surface.cValue} onChange={e => handleSurfaceChange(index, 'cValue', e.target.value)} className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="C Value" />
            </div>
          ))}
            {results.totalCoverage !== 100 && (
                <p className="text-yellow-500 text-sm">Warning: Total coverage is {results.totalCoverage.toFixed(0)}%, not 100%.</p>
            )}
        </div>
      </Card>
      
      <div className="space-y-8">
        <Card title="C-Value Configuration">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input id="c100Multiplier" label="C100 Multiplier" type="number" value={data.c100Multiplier} onChange={handleInputChange} />
                <Input id="c100Cap" label="C100 Cap" type="number" value={data.c100Cap} onChange={handleInputChange} />
            </div>
        </Card>
        <Card title="Results">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <span className="font-medium">10-yr Weighted C (C10):</span>
              <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{results.c10.toFixed(3)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <span className="font-medium">100-yr Weighted C (C100):</span>
              <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{results.c100.toFixed(3)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
