import { getUserAccounts } from '@/actions/dashboard'
import React from 'react'
import AddTransactionForm from './add-transaction-form';
import { defaultCategories } from '@/data/categories';

const CreateTransactionPage = async() => {
  const accounts = await getUserAccounts();
  return (
    <div>
      <h1>Create Transaction</h1>
      <AddTransactionForm accounts = {accounts} categories = {defaultCategories}/>
      
    </div>
  )
}

export default CreateTransactionPage