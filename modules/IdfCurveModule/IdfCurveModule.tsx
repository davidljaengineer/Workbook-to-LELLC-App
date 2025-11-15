import React, { useMemo, useState } from 'react';
import { useProject } from '../../hooks/useProject';
import { Card } from '../../components/common/Card';
import { DURATION_TO_MINUTES } from '../../constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { IdfPoint } from '../../types';
import { produce } from 'immer';
import { Input } from '../../components/common/Input';

export const IdfCurveModule: React.FC = () => {
    const { activeProject, updateProject } = useProject();
    const [interpDuration, setInterpDuration] = useState<string>('');
    const [interpReturnPeriod, setInterpReturnPeriod] = useState<string>('');
    const [interpolatedResult, setInterpolatedResult] = useState<{ intensity: number | null; message: string }>({ intensity: null, message: '' });
    const [newReturnPeriod, setNewReturnPeriod] = useState('');

    if (!activeProject) return <div className="text-center p-8">Please select a project to begin.</div>;

    const handleRainfallChange = (rowIndex: number, period: string, value: string) => {
        const updatedProject = produce(activeProject, draft => {
            draft.rainfall.depths[rowIndex][period] = value === '' ? '' : parseFloat(value);
        });
        updateProject(updatedProject);
    };

    const handleAddReturnPeriod = () => {
        if (!newReturnPeriod.trim()) return;

        // Basic validation for "N-yr" format
        if (!/^\d+-yr$/.test(newReturnPeriod.trim())) {
            alert("Please use the format 'N-yr' (e.g., '50-yr').");
            return;
        }

        if (activeProject.rainfall.returnPeriods.includes(newReturnPeriod.trim())) {
            alert("This return period already exists.");
            return;
        }

        const updatedProject = produce(activeProject, draft => {
            const newPeriod = newReturnPeriod.trim();
            draft.rainfall.returnPeriods.push(newPeriod);
            draft.rainfall.depths.forEach(depth => {
                depth[newPeriod] = 0; // Default new depths to 0
            });
        });
        updateProject(updatedProject);
        setNewReturnPeriod('');
    };

    const handleRemoveReturnPeriod = (periodToRemove: string) => {
        if (activeProject.rainfall.returnPeriods.length <= 1) {
            alert("Cannot remove the last return period.");
            return;
        }

        const updatedProject = produce(activeProject, draft => {
            draft.rainfall.returnPeriods = draft.rainfall.returnPeriods.filter(p => p !== periodToRemove);
            draft.rainfall.depths.forEach(depth => {
                delete depth[periodToRemove];
            });
        });
        updateProject(updatedProject);
    };


    const idfData = useMemo<IdfPoint[]>(() => {
        return activeProject.rainfall.depths.map(depthRow => {
            const durationMinutes = DURATION_TO_MINUTES[depthRow.duration];
            const point: IdfPoint = { duration: durationMinutes };
            
            activeProject.rainfall.returnPeriods.forEach(period => {
                const depth = Number(depthRow[period]);
                if (!isNaN(depth) && durationMinutes > 0) {
                    point[period] = (depth / (durationMinutes / 60));
                } else {
                    point[period] = 0;
                }
            });
            return point;
        });
    }, [activeProject]);

    const handleInterpolation = () => {
        const targetDuration = parseFloat(interpDuration);
        const targetReturnPeriod = parseFloat(interpReturnPeriod);

        if (isNaN(targetDuration) || isNaN(targetReturnPeriod)) {
            setInterpolatedResult({ intensity: null, message: 'Please enter valid numbers for duration and return period.' });
            return;
        }

        const returnPeriods = activeProject.rainfall.returnPeriods.map(p => parseInt(p.replace('-yr', ''))).sort((a,b) => a-b);
        const durations = idfData.map(d => d.duration).sort((a,b) => a-b);

        if (targetDuration < durations[0] || targetDuration > durations[durations.length - 1]) {
            setInterpolatedResult({ intensity: null, message: `Duration must be between ${durations[0]} and ${durations[durations.length - 1]} minutes.` });
            return;
        }
        if (targetReturnPeriod < returnPeriods[0] || targetReturnPeriod > returnPeriods[returnPeriods.length - 1]) {
            setInterpolatedResult({ intensity: null, message: `Return period must be between ${returnPeriods[0]} and ${returnPeriods[returnPeriods.length - 1]} years.` });
            return;
        }

        const sortedIdfData = [...idfData].sort((a, b) => a.duration - b.duration);

        const d2_idx = sortedIdfData.findIndex(p => p.duration >= targetDuration);
        const d1_idx = d2_idx > 0 && sortedIdfData[d2_idx].duration > targetDuration ? d2_idx - 1 : d2_idx;
        
        const sortedReturnPeriods = activeProject.rainfall.returnPeriods
            .map(p => ({ str: p, num: parseInt(p.replace('-yr', ''))}))
            .sort((a, b) => a.num - b.num);

        const T2_num_idx = sortedReturnPeriods.findIndex(T => T.num >= targetReturnPeriod);
        const T1_num_idx = T2_num_idx > 0 && sortedReturnPeriods[T2_num_idx].num > targetReturnPeriod ? T2_num_idx - 1 : T2_num_idx;

        const d1 = sortedIdfData[d1_idx].duration;
        const d2 = sortedIdfData[d2_idx].duration;
        const T1 = sortedReturnPeriods[T1_num_idx].num;
        const T2 = sortedReturnPeriods[T2_num_idx].num;
        
        const T1_str = sortedReturnPeriods[T1_num_idx].str;
        const T2_str = sortedReturnPeriods[T2_num_idx].str;


        const I_d1_T1 = sortedIdfData[d1_idx][T1_str] as number;
        const I_d2_T1 = sortedIdfData[d2_idx][T1_str] as number;
        const I_d1_T2 = sortedIdfData[d1_idx][T2_str] as number;
        const I_d2_T2 = sortedIdfData[d2_idx][T2_str] as number;
        
        if ([I_d1_T1, I_d2_T1, I_d1_T2, I_d2_T2].some(i => i <= 0 || isNaN(i))) {
            setInterpolatedResult({ intensity: null, message: 'Cannot interpolate with zero, negative, or invalid intensity values in the source data.' });
            return;
        }

        let I_targetD_T1, I_targetD_T2;
        if (d1 === d2) {
            I_targetD_T1 = I_d1_T1;
            I_targetD_T2 = I_d1_T2;
        } else {
            const log_d = Math.log(targetDuration);
            const log_d1 = Math.log(d1);
            const log_d2 = Math.log(d2);
            
            const log_I_d1_T1 = Math.log(I_d1_T1);
            const log_I_d2_T1 = Math.log(I_d2_T1);
            const log_I_targetD_T1 = log_I_d1_T1 + (log_I_d2_T1 - log_I_d1_T1) * (log_d - log_d1) / (log_d2 - log_d1);
            I_targetD_T1 = Math.exp(log_I_targetD_T1);

            const log_I_d1_T2 = Math.log(I_d1_T2);
            const log_I_d2_T2 = Math.log(I_d2_T2);
            const log_I_targetD_T2 = log_I_d1_T2 + (log_I_d2_T2 - log_I_d1_T2) * (log_d - log_d1) / (log_d2 - log_d1);
            I_targetD_T2 = Math.exp(log_I_targetD_T2);
        }
        
        let final_I;
        if (T1 === T2) {
            final_I = I_targetD_T1;
        } else {
            // Perform log-log interpolation for return period as well, to match duration method and explanation.
            const log_I_targetD_T1 = Math.log(I_targetD_T1);
            const log_I_targetD_T2 = Math.log(I_targetD_T2);
            const log_T = Math.log(targetReturnPeriod);
            const log_T1 = Math.log(T1);
            const log_T2 = Math.log(T2);
            
            const log_final_I = log_I_targetD_T1 + (log_I_targetD_T2 - log_I_targetD_T1) * (log_T - log_T1) / (log_T2 - log_T1);
            final_I = Math.exp(log_final_I);
        }

        setInterpolatedResult({ 
            intensity: final_I, 
            message: `Interpolated Intensity: ${final_I.toFixed(3)} in/hr`
        });
    };

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="space-y-8">
            <Card title="Rainfall Depths (inches)">
                <div className="flex items-end space-x-2 mb-4">
                     <div className='flex-grow'>
                        <Input 
                            label="New Return Period" 
                            id="newReturnPeriod" 
                            value={newReturnPeriod} 
                            onChange={(e) => setNewReturnPeriod(e.target.value)}
                            unit="e.g., 50-yr"
                        />
                     </div>
                    <button 
                        onClick={handleAddReturnPeriod} 
                        className="px-4 py-2.5 h-[42px] text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Add
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Duration</th>
                                {activeProject.rainfall.returnPeriods.map(period => (
                                    <th key={period} scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                        <div className="flex items-center justify-between">
                                            <span>{period}</span>
                                            {activeProject.rainfall.returnPeriods.length > 1 && (
                                                <button onClick={() => handleRemoveReturnPeriod(period)} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 ml-2 p-1 rounded-full opacity-50 hover:opacity-100">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {activeProject.rainfall.depths.map((row, rowIndex) => (
                                <tr key={row.duration}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{row.duration}</td>
                                    {activeProject.rainfall.returnPeriods.map(period => (
                                        <td key={period} className="px-6 py-4 whitespace-nowrap text-sm">
                                            <input
                                                type="number"
                                                value={row[period] as number}
                                                onChange={(e) => handleRainfallChange(rowIndex, period, e.target.value)}
                                                className="w-24 bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card title="Intensity-Duration-Frequency (IDF) Curve">
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <LineChart data={idfData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="duration" type="number" scale="log" domain={['auto', 'auto']} tickFormatter={(tick) => `${tick} min`} name="Duration (min)" />
                            <YAxis name="Intensity (in/hr)" label={{ value: 'Intensity (in/hr)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip formatter={(value: number) => value.toFixed(2)} labelFormatter={(label) => `Duration: ${label} min`} />
                            <Legend />
                            {activeProject.rainfall.returnPeriods.map((period, index) => (
                                <Line key={period} type="monotone" dataKey={period} stroke={colors[index % colors.length]} dot={false} strokeWidth={2}/>
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>
            
            <Card title="IDF Data Table (Intensity in in/hr)">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Duration</th>
                                {activeProject.rainfall.returnPeriods.map(period => (
                                    <th key={period} scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{period} (in/hr)</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {idfData.map((row) => (
                                <tr key={row.duration}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{row.duration} min</td>
                                    {activeProject.rainfall.returnPeriods.map(period => (
                                        <td key={period} className="px-6 py-4 whitespace-nowrap text-sm">
                                            {(row[period] as number).toFixed(2)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card title="Interpolate Intensity">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <Input 
                        label="Storm Duration" 
                        id="interpDuration" 
                        type="number" 
                        value={interpDuration} 
                        onChange={(e) => setInterpDuration(e.target.value)} 
                        unit="min" 
                    />
                    <Input 
                        label="Return Period" 
                        id="interpReturnPeriod" 
                        type="number" 
                        value={interpReturnPeriod} 
                        onChange={(e) => setInterpReturnPeriod(e.target.value)} 
                        unit="yr" 
                    />
                    <button 
                        onClick={handleInterpolation} 
                        className="px-4 py-2.5 h-fit text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Calculate
                    </button>
                </div>
                {(interpolatedResult.message) && (
                    <div className={`mt-4 p-3 rounded-lg ${interpolatedResult.intensity === null ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' : 'bg-slate-100 dark:bg-slate-700'}`}>
                        <p className="text-sm font-medium">{interpolatedResult.message}</p>
                    </div>
                )}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="font-semibold text-md mb-2 text-slate-700 dark:text-slate-300">About the Interpolation Method</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    The intensity is calculated using a standard bilinear interpolation method on a log-log scale, which is a common practice for IDF data.
                  </p>
                  <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 mt-2 space-y-1">
                    <li><strong>Duration & Return Period:</strong> The calculation logarithmically interpolates between the two closest data points for both storm duration and return period.</li>
                    <li><strong>Limitation:</strong> This method is only valid for values <em>within</em> the range of your provided rainfall data. It cannot be used to extrapolate beyond the minimum or maximum durations and return periods.</li>
                  </ul>
                </div>
            </Card>
        </div>
    );
};