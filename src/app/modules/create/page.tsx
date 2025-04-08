import ModuleForm from '@/app/components/module/ModuleForm';

export default function CreateModulePage() {
  return (
    <div className="flex min-h-screen">
      <main className="flex-1 p-8 max-w-2xl mx-auto">
        <ModuleForm />
      </main>
    </div>
  );
}