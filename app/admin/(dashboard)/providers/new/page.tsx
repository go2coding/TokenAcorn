import ProviderForm from "@/components/admin/forms/ProviderForm";

export default function NewProviderPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
        新建厂商 / New Provider
      </h1>
      <ProviderForm />
    </div>
  );
}
