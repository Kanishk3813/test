import ModuleDetail from '@/app/components/module/ModuleDetail';

export default function ModulePage({ params }: { params: { moduleId: string } }) {
  return (
    <div className="flex min-h-screen">
      <main className="flex-1 p-8">
        <ModuleDetail moduleId={params.moduleId} />
      </main>
    </div>
  );
}