import { getUserAccounts } from "@/actions/dashboard";
import { getTransaction } from "@/actions/transactions";
import AddTransactionForm from "./add-transaction-form";
import { defaultCategories } from "@/data/categories";

interface PageProps {
  searchParams: Promise<{ edit?: string; id?: string }>;
}

const CreateTransactionPage = async ({
  searchParams,
}: PageProps) => {
  const { edit, id } = await searchParams;
  const isEditMode = edit === "true" && !!id;

  const accounts = await getUserAccounts();
  let initialData = null;

  if (isEditMode && id) {
    initialData = await getTransaction(id);
  }

  return (
    <div className="min-h-screen p-4">
      <AddTransactionForm 
        accounts={accounts}
        categories={defaultCategories}
        editMode={isEditMode}
        initialData={initialData}
      />
    </div>
  );
};

export default CreateTransactionPage;
