import React from 'react';
import { useProject } from '../../hooks/useProject';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { produce } from 'immer';

export const InputModule: React.FC = () => {
    const { activeProject, updateProject } = useProject();

    if (!activeProject) return <div className="text-center p-8">Please select a project to begin.</div>;

    const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        const updatedProject = produce(activeProject, draft => {
            draft.metadata[id as keyof typeof draft.metadata] = value;
        });
        updateProject(updatedProject);
    };

    return (
        <div className="space-y-8">
            <Card title="Project Setup">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input id="name" label="Project Name" value={activeProject.metadata.name} onChange={handleMetadataChange} />
                    <Input id="number" label="Project Number" value={activeProject.metadata.number} onChange={handleMetadataChange} />
                    <Input id="location" label="Location (City, State)" value={activeProject.metadata.location} onChange={handleMetadataChange} />
                    <Input id="engineer" label="Project Engineer" value={activeProject.metadata.engineer} onChange={handleMetadataChange} />
                    <div className="md:col-span-2">
                        <Input id="references" label="References" as="textarea" value={activeProject.metadata.references} onChange={handleMetadataChange} />
                    </div>
                </div>
            </Card>
        </div>
    );
};
