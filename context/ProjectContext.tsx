
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Project } from '../types';
import { sampleProject, createNewProject } from '../lib/seedData';
import { v4 as uuidv4 } from 'uuid';

interface ProjectContextType {
  projects: Project[];
  activeProjectId: string | null;
  activeProject: Project | null;
  setActiveProjectId: (id: string | null) => void;
  updateProject: (updatedProject: Project) => void;
  createProject: () => void;
  deleteProject: (id: string) => void;
}

export const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// A simple hook to persist state to localStorage
const useStickyState = <T,>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
};

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useStickyState<Project[]>([sampleProject], 'drainage-app-projects');
  const [activeProjectId, setActiveProjectId] = useStickyState<string | null>(sampleProject.id, 'drainage-app-activeProjectId');

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  const updateProject = (updatedProject: Project) => {
    setProjects(prevProjects =>
      prevProjects.map(p => (p.id === updatedProject.id ? updatedProject : p))
    );
  };

  const createProject = () => {
    const newProject = createNewProject();
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) {
        const nextId = projects.length > 1 ? projects.find(p => p.id !== id)?.id || null : null;
        setActiveProjectId(nextId);
    }
  };

  return (
    <ProjectContext.Provider value={{ projects, activeProjectId, activeProject, setActiveProjectId, updateProject, createProject, deleteProject }}>
      {children}
    </ProjectContext.Provider>
  );
};
