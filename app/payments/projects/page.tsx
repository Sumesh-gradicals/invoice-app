"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useProjects, ProjectPhase } from "@/components/providers/ProjectContext";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown } from "lucide-react";

const phases: ProjectPhase[] = ["Inquiry", "Proposal", "Booked", "In progress", "Complete"];

function ProjectCard({ project, isDragging = false }: { project: any; isDragging?: boolean }) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: project.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const primaryCustomer = project.customers?.[0];
  const lastActivityDate = new Date(project.lastActivity);
  const now = new Date();
  const diffMs = now.getTime() - lastActivityDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let activityText = "just now";
  if (diffMins < 60) {
    activityText = `${diffMins}m ago`;
  } else if (diffHours < 24) {
    activityText = `${diffHours}h ago`;
  } else {
    activityText = `${diffDays}d ago`;
  }

  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/payments/projects/${project.id}`);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border border-slate-200 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow cursor-move"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 
          onClick={handleNameClick}
          onPointerDown={(e) => e.stopPropagation()}
          className="font-bold text-sm cursor-pointer hover:text-blue-600 relative z-10"
        >
          {project.name}
        </h3>
        <div className="w-4 h-4 rounded-full bg-slate-200"></div>
      </div>
      {primaryCustomer && (
        <div className="text-xs text-slate-600 mb-1">{primaryCustomer.name}</div>
      )}
      <div className="text-xs text-slate-400">Last activity: {activityText}</div>
    </div>
  );
}

function KanbanColumn({ phase, projects }: { phase: ProjectPhase; projects: any[] }) {
  const { setNodeRef } = useDroppable({
    id: phase,
  });

  return (
    <div className="flex-1 min-w-[250px]">
      <div className="bg-slate-50 rounded-t-lg p-3 border-b-2 border-slate-200">
        <h2 className="font-bold text-sm">{phase}</h2>
      </div>
      <div ref={setNodeRef} className="bg-slate-50 p-3 min-h-[600px]">
        <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { projects, moveProject, getProjectsByPhase } = useProjects();
  const [sortBy, setSortBy] = useState("recent");
  const [activeId, setActiveId] = useState<string | null>(null);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;

    const activeProject = projects.find((p) => p.id === active.id);
    if (!activeProject) return;

    // Check if dropped over a phase column
    const overPhase = phases.find((p) => p === over.id);
    if (overPhase && overPhase !== activeProject.phase) {
      moveProject(active.id as string, overPhase);
      return;
    }

    // Check if dropped over another project
    const overProject = projects.find((p) => p.id === over.id);
    if (overProject && overProject.phase !== activeProject.phase) {
      moveProject(active.id as string, overProject.phase);
    }
  };

  const activeProject = activeId ? projects.find((p) => p.id === activeId) : null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="text-sm font-bold">View as Board</button>
          <button className="px-3 py-1 text-xs font-bold border rounded-full flex items-center gap-1">
            Sort by {sortBy === "recent" ? "Recent activity: new to old" : sortBy}
            <ChevronDown size={14} />
          </button>
        </div>
        <button
          onClick={() => router.push("/payments/projects/new")}
          className="bg-black text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-zinc-800"
        >
          Create <ChevronDown size={14} />
        </button>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {phases.map((phase) => (
            <KanbanColumn
              key={phase}
              phase={phase}
              projects={getProjectsByPhase(phase)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeProject ? <ProjectCard project={activeProject} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
