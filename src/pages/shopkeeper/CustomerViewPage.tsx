import { useNavigate, useParams } from "react-router-dom";
import {
  Star,
  MessageSquare,
  Phone,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { customerApi, transactionApi } from "@/api";
import CustomerViewSkeleton from "@/components/CustomerViewSkeleton";
import { useState } from "react";
import { Modal } from "@/components/shared";
import ReminderModal from "@/components/RemainderModal";

const CustomerViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isOpenReminder, setIsOpenRemainder] = useState(false);

  const { data: cr, isLoading } = useQuery({
    queryKey: ["shopCustomers", id],
    queryFn: () => customerApi.getSingleCustomer(id as string),
    enabled: !!id,
  });

  const { data: cusTxnR, isLoading: isCusTxnrLoading } = useQuery({
    queryKey: ["custTxns", id],
    queryFn: () =>
      transactionApi.getShopTransactions({ customerId: id, limit: 6 }),
    enabled: !!id,
  });

  const customer = cr?.data?.data;
  const customerTransaction = cusTxnR?.data?.data;

  const formatDateTimeBn = (isoString: string) => {
    const date = new Date(isoString);

    const datePart = new Intl.DateTimeFormat("bn-BD", {
      day: "numeric",
      month: "long",
      year: "2-digit",
    }).format(date);

    const timePart = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);

    return `${datePart} • ${timePart}`;
  };

  if (isLoading || isCusTxnrLoading) {
    return <CustomerViewSkeleton />;
  }

  return (
    <div className="p-4 space-y-4 bg-gray-50 dark:bg-slate-900 ">
      {/* Card Container */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="text-2xl font-bold text-slate-200 flex items-center justify-center rounded-full bg-green-600 w-16 h-16">
            {customer?.customer?.name.charAt(0)}
          </div>

          <h2 className="font-semibold text-lg text-slate-900 dark:text-white ">
            {customer?.customer?.name}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {customer?.customer?.mobile}
          </p>

          {/* Rating */}
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className="fill-yellow-400 text-yellow-400"
              />
            ))}
            <Star size={16} className="text-slate-600 dark:text-slate-500" />
          </div>
        </div>

        {/* Due Card */}
        <div className="bg-red-600/90 rounded-xl p-4 text-center">
          <p className="text-sm text-red-100">বর্তমান বাকি</p>
          <h1 className="text-xl font-bold text-white">
            ৳ {customer?.balance} বাকি
          </h1>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            className="flex items-center justify-center gap-1 flex-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-lg py-2 text-sm transition"
            onClick={() => setIsOpenRemainder(true)}
          >
            <MessageSquare size={16} />
            রিমাইন্ডার
          </button>

          <button
            onClick={() => window.open(`tel:${customer?.mobile}`)}
            className="flex items-center justify-center gap-1 flex-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-lg py-2 text-sm transition"
          >
            <Phone size={16} />
            কল
          </button>
        </div>

        {/* Transactions Header */}
        <div className="flex justify-between items-center text-sm font-medium">
          <span className="text-slate-700 dark:text-slate-300">হিসাব খাতা</span>
          <button className="text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300">
            সব দেখুন
          </button>
        </div>

        {/* Transaction List */}
        <div className="space-y-2">
          {/* Item */}
          {customerTransaction?.map((txn: any) => (
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 rounded-xl p-3">
              <div className="flex items-center gap-2">
                {txn.type === "BAKI" ? (
                  <ArrowUpRight size={18} className="text-red-400" />
                ) : (
                  <ArrowDownLeft size={18} className="text-green-400" />
                )}

                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {(txn?.note ?? txn?.type === "BAKI") ? "বাকি" : "পরিশোধ"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDateTimeBn(txn?.createdAt)}
                  </p>
                </div>
              </div>
              <span
                className={`${txn.type === "BAKI" ? "text-red-400" : "text-green-400"} font-semibold`}
              >
                ৳ {txn.amount}
              </span>
            </div>
          ))}
        </div>

        {/* Add Button */}
        <button
          className="w-full bg-teal-500 hover:bg-teal-400 text-black font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition"
          onClick={() =>
            navigate("/shopkeeper/calculator", {
              state: { custId: id },
            })
          }
        >
          <Plus size={18} />
          হিসাব করুন
        </button>
      </div>
      {isOpenReminder && (
        <Modal
          title="রিমাইন্ডার"
          open={isOpenReminder}
          onClose={() => setIsOpenRemainder(false)}
        >
          <ReminderModal customer={customer} />
        </Modal>
      )}
    </div>
  );
};

export default CustomerViewPage;
