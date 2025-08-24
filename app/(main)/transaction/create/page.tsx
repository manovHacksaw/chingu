import { getUserAccounts } from "@/actions/dashboard";
import { getTransaction } from "@/actions/transactions";
import AddTransactionForm from "./add-transaction-form";
import { defaultCategories } from "@/data/categories";
import { Metadata } from "next";

interface PageProps {
  searchParams: Promise<{ edit?: string; id?: string }>;
}

export const metadata: Metadata = {
  title: "Add Transaction - Chingu",
  description: "Create or edit transactions with Chingu's smart expense tracker.",
};


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
