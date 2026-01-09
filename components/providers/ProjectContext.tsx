"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ProjectPhase = "Inquiry" | "Proposal" | "Booked" | "In progress" | "Complete";

export type Project = {
  id: string;
  name: string;
  phase: ProjectPhase;
  customers: any[]; // Array of customer objects, first one is primary
  date?: string;
  description?: string;
  estimatedValue?: number;
  winConfidence?: string;
  createdAt: string;
  lastActivity: string;
};

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Omit<Project, "id" | "createdAt" | "lastActivity">) => Promise<Project | null>;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  moveProject: (id: string, newPhase: ProjectPhase) => void;
  getProjectsByPhase: (phase: ProjectPhase) => Project[];
  addCustomerToProject: (projectId: string, customerId: string) => Promise<void>;
  removeCustomerFromProject: (projectId: string, customerId: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

import { getProjects, addProject as addProjectAction, updateProjectPhase, addCustomerToProject as addCustomerToProjectAction, removeCustomerFromProject as removeCustomerFromProjectAction } from "@/app/actions/projects";

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from Database
  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (e) {
        console.error("Failed to fetch projects", e);
      } finally {
        setIsLoaded(true);
      }
    }
    loadProjects();
  }, []);

  const addProject = async (projectData: Omit<Project, "id" | "createdAt" | "lastActivity">) => {
    try {
      const result = await addProjectAction({
        ...projectData,
        customers: projectData.customers.map((c, i) => ({ id: c.id, isPrimary: i === 0 }))
      });
      // Refresh projects from DB to get full structure
      const updatedProjects = await getProjects();
      setProjects(updatedProjects);
      return result as Project;
    } catch (e) {
      console.error("Failed to add project", e);
      return null;
    }
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    // This can be expanded to a server action if needed
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === id
          ? { ...proj, ...updates, lastActivity: new Date().toISOString() }
          : proj
      )
    );
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((proj) => proj.id !== id));
  };

  const moveProject = async (id: string, newPhase: ProjectPhase) => {
    try {
      await updateProjectPhase(id, newPhase);
      setProjects((prev) =>
        prev.map((proj) =>
          proj.id === id ? { ...proj, phase: newPhase, lastActivity: new Date().toISOString() } : proj
        )
      );
    } catch (e) {
      console.error("Failed to move project", e);
    }
  };

  const getProjectsByPhase = (phase: ProjectPhase) => {
    return projects.filter((proj) => proj.phase === phase);
  };

  const addCustomerToProject = async (projectId: string, customerId: string) => {
    try {
      await addCustomerToProjectAction(projectId, customerId);
      // Refresh projects to get updated customer list
      const updatedProjects = await getProjects();
      setProjects(updatedProjects);
    } catch (e) {
      console.error("Failed to add customer to project", e);
    }
  };

  const removeCustomerFromProject = async (projectId: string, customerId: string) => {
    try {
      await removeCustomerFromProjectAction(projectId, customerId);
      // Refresh projects to get updated customer list
      const updatedProjects = await getProjects();
      setProjects(updatedProjects);
    } catch (e) {
      console.error("Failed to remove customer from project", e);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        addProject,
        updateProject,
        deleteProject,
        moveProject,
        getProjectsByPhase,
        addCustomerToProject,
        removeCustomerFromProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
}
