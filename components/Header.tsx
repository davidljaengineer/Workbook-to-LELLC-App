
import React from 'react';
import { useProject } from '../hooks/useProject';

export const Header: React.FC = () => {
    const { projects, activeProjectId, setActiveProjectId, createProject, deleteProject, activeProject } = useProject();

    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setActiveProjectId(e.target.value);
    };

    const handleDelete = () => {
        if (activeProjectId && window.confirm(`Are you sure you want to delete project "${activeProject?.metadata.name}"?`)) {
            deleteProject(activeProjectId);
        }
    };

    return (
        <header className="bg-white dark:bg-slate-800 shadow-md p-4 flex items-center justify-between z-10">
            <h1 className="text-xl font-bold text-slate-700 dark:text-slate-200 hidden md:block">Drainage Engineering Calculator</h1>
            <div className="flex items-center space-x-2">
                <label htmlFor="project-select" className="text-sm font-medium">Project:</label>
                <select
                    id="project-select"
                    value={activeProjectId || ''}
                    onChange={handleProjectChange}
                    className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                >
                    {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.metadata.name}</option>
                    ))}
                </select>
                <button onClick={createProject} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    New
                </button>
                {projects.length > 1 && (
                     <button onClick={handleDelete} className="p-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
            </div>
        </header>
    );
};
