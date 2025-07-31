import { getUserAccounts } from "@/actions/dashboard";
import { getTransaction } from "@/actions/transactions";
import AddTransactionForm from "./add-transaction-form";
import { notFound } from "next/navigation";
import { defaultCategories } from "@/data/categories";

interface PageProps {
  searchParams: Promise<{ edit?: string; id?: string }>;
}

const CreateTransactionPage = async ({ searchParams }: PageProps) => {
  // Await the searchParams Promise
  const resolvedSearchParams = await searchParams;
  
  const { edit,  id } = resolvedSearchParams;
  
  console.log("Search params:", resolvedSearchParams);
  console.log("IS EDIT?", edit, "ID:", id);
  
  const isEditMode = edit === "true";
  
  const accounts = await getUserAccounts();
  
  let initialData = null;
  
  // If in edit mode, fetch the transaction data
if(isEditMode && id !== null){
  initialData = await getTransaction(id);
  console.log(initialData)

}
  
  return (
    <div>
      <AddTransactionForm 
        accounts={accounts}
        categories = {defaultCategories}
        editMode = {!!id}
        initialData = {initialData}
      />
    </div>
  );
};

export default CreateTransactionPage;