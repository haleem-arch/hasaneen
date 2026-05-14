import { Outlet } from 'react-router-dom';
import CoachSidebar from './CoachSidebar';

export default function CoachLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <CoachSidebar />
      <main className="flex-1 ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
