import { useParams } from "react-router-dom";
import { Star, ArrowUpRight, ArrowDownLeft, Loader } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { customerApi, transactionApi } from "@/api";

const CustomerTxnView = () => {
  const { sid, cid } = useParams();

  const { data: cr, isLoading } = useQuery({
    queryKey: ["customerTxnView", sid, cid],
    queryFn: () => customerApi.getCustomerTxn(sid as string, cid as string),
    enabled: !!sid,
  });

  const { data: cusTxnR, isLoading: isCusTxnrLoading } = useQuery({
    queryKey: ["custTxns", cid, sid],
    queryFn: () =>
      transactionApi.getCustomerShopTxn(sid as string, cid as string),
    enabled: !!cid,
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
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader className="animate-spin w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 bg-white dark:bg-slate-900 min-h-screen">
      {/* Card Container */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center gap-3">
          <div className="flex items-center text-center space-y-2 gap-4">
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center rounded-full bg-green-600 w-16 h-16">
              {customer?.customer?.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-semibold text-lg text-slate-900 dark:text-white text-left">
                {customer?.customer?.name}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {customer?.customer?.mobile}
              </p>
            </div>
          </div>
          <div>
            <h1
              className={`${customer?.balance > 0 ? "text-red-600/90" : "text-green-600/90"} font-bold text-xl`}
            >
              ৳ {customer?.balance}
            </h1>
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-2">
          {/* Item */}
          {customerTransaction?.map((txn: any) => (
            <div className="flex justify-between items-center bg-gray-100 dark:bg-slate-800 rounded-xl p-3">
              <div className="flex items-center gap-2">
                {txn.type === "BAKI" ? (
                  <ArrowUpRight size={18} className="text-red-400" />
                ) : (
                  <ArrowDownLeft size={18} className="text-green-400" />
                )}

                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {txn?.note
                      ? txn?.note
                      : txn?.type === "BAKI"
                        ? "বাকি"
                        : "পরিশোধ"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
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
      </div>
    </div>
  );
};

export default CustomerTxnView;
