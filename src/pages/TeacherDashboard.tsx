
import React from "react";
import { Link } from "react-router-dom";
import { Users, ClipboardEdit, FileText, BarChart2 } from "lucide-react";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";

const cards = [
  { 
    icon: Users, 
    title: "Manage Classes", 
    href: "/teacher/classes",
    desc: "Create and organize classes, add students, and track progress." 
  },
  { 
    icon: ClipboardEdit, 
    title: "Assign Essays", 
    href: "/teacher/assign",
    desc: "Create new writing assignments for your students." 
  },
  { 
    icon: FileText, 
    title: "My Essays", 
    href: "/teacher/essays",
    desc: "View all assignments with delivery stats and reminders." 
  },
  { 
    icon: BarChart2, 
    title: "View Analytics", 
    href: "/teacher/analytics",
    desc: "Track student progress and identify areas for improvement." 
  },
];

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  
  const teacherName = user?.email?.split('@')[0] || 'Teacher';

  return (
    <DashboardLayout title="Teacher Dashboard">
      <h2 className="mb-6 text-lg font-medium text-slate-900 dark:text-slate-100">
        Welcome back, {teacherName}
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ icon: Icon, title, href, desc }) => (
          <Link
            key={title}
            to={href}
            className="group rounded-xl border bg-card p-6 shadow-sm transition
                       hover:shadow-md focus-visible:outline-none focus-visible:ring-2
                       hover:ring-2 hover:ring-primary/60 dark:hover:ring-primary/40"
          >
            <Icon className="mb-4 h-8 w-8 text-primary group-hover:scale-105 transition-transform" />
            <h3 className="text-base font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
