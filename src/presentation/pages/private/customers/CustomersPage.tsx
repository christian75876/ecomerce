import { useCustomersCreditManagement } from '@/application/useCases/customers/useCustomersCreditManagement';
import { CustomersCreditManagementView } from '@/presentation/ui/organisms/customers/CustomersCreditManagementView';

const CustomersPage = () => {
  const customersManagement = useCustomersCreditManagement();

  return (
    <CustomersCreditManagementView
      customers={customersManagement.customers}
      selectedCustomerId={customersManagement.selectedCustomerId}
      ledger={customersManagement.ledger}
      creditLimit={customersManagement.creditLimit}
      paymentAmount={customersManagement.paymentAmount}
      paymentNote={customersManagement.paymentNote}
      search={customersManagement.search}
      loading={customersManagement.loading}
      submitting={customersManagement.submitting}
      error={customersManagement.error}
      onSelectCustomer={customersManagement.setSelectedCustomerId}
      onCreditLimitChange={customersManagement.setCreditLimit}
      onPaymentAmountChange={customersManagement.setPaymentAmount}
      onPaymentNoteChange={customersManagement.setPaymentNote}
      onSearchChange={customersManagement.setSearch}
      onToggleCredit={customersManagement.updateCustomerCredit}
      onRegisterPayment={customersManagement.registerPayment}
    />
  );
};

export default CustomersPage;
