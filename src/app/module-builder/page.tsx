import ModuleList from '@/app/components/module/ModuleList';

export default function ModuleBuilderPage() {
  return (
    <div className="flex min-h-screen">
      <main className="flex-1 p-8">
        <ModuleList />
      </main>
    </div>
  );
}