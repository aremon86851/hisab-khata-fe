import { useNavigate, useParams } from "react-router-dom";
import {
  Star,
  MessageSquare,
  Phone,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  ShieldAlert,
  Camera,
  UserMinus,
  CheckCircle2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi, transactionApi, fraudApi } from "@/api";
import CustomerViewSkeleton from "@/components/CustomerViewSkeleton";
import { useState, useRef } from "react";
import { Modal } from "@/components/shared";
import ReminderModal from "@/components/RemainderModal";
import { useBasePath } from "@/hooks/useBasePath";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";
import { useAuth } from "@/hooks/useAuth";
import { getApiError } from "@/utils/helpers";

const FRAUD_TYPES = [
  { value: "UNPAID_DEBT", label: "বাকি দেয়নি 💸" },
  { value: "ABSCONDED", label: "পালিয়ে গেছে 🏃" },
  { value: "FAKE_INFO", label: "ভুল তথ্য দিয়েছে 🤥" },
  { value: "MULTIPLE_SHOPS", label: "একাধিক দোকানে বাকি 🏪" },
  { value: "OTHER", label: "অন্যান্য" },
];

const CustomerViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const basePath = useBasePath();
  const staffPerms = useStaffPermissions();
  const { role } = useAuth();
  const qc = useQueryClient();
  const isShopkeeper = role === "SHOPKEEPER";
  const [isOpenReminder, setIsOpenRemainder] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [showUnlink, setShowUnlink] = useState(false);

  // Photo upload (1b: shopkeeper uploads customer photo)
  const handleCustomerImageUpload = async (file: File) => {
    setImageUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      await customerApi.uploadCustomerImage(customer?.customer?.id!, fd);
      qc.invalidateQueries({ queryKey: ["shopCustomers", id] });
    } finally {
      setImageUploading(false);
    }
  };

  const unlinkMut = useMutation({
    mutationFn: () => customerApi.unlinkCustomer(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shopCustomers"] });
      navigate(`${basePath}/customers`);
    },
  });

  const settleMut = useMutation({
    mutationFn: () => customerApi.settleCustomer(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shopCustomers", id] }),
  });

  const requestAccessMut = useMutation({
    mutationFn: () => customerApi.toggleRequestAccess(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shopCustomers", id] }),
  });

  // Fraud report state
  const [showFraudModal, setShowFraudModal] = useState(false);
  const [fraudType, setFraudType] = useState("");
  const [fraudDesc, setFraudDesc] = useState("");
  const [fraudAmount, setFraudAmount] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [fraudErr, setFraudErr] = useState("");
  const [fraudDone, setFraudDone] = useState(false);

  const fraudMut = useMutation({
    mutationFn: (customerId: string) =>
      fraudApi.reportFraud({
        customerId,
        type: fraudType,
        description: fraudDesc || undefined,
        amountOwed: fraudAmount ? Number(fraudAmount) : undefined,
        isAnonymous,
      }),
    onSuccess: () => {
      setFraudDone(true);
      qc.invalidateQueries({ queryKey: ["fraudFeed"] });
      setTimeout(() => {
        setShowFraudModal(false);
        setFraudDone(false);
        setFraudType("");
        setFraudDesc("");
        setFraudAmount("");
        setFraudErr("");
      }, 2000);
    },
    onError: (e) => setFraudErr(getApiError(e)),
  });

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
  console.log("Customer Details:", customer);

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
          <div className="relative">
            <div className="text-2xl font-bold text-slate-200 flex items-center justify-center rounded-full bg-green-600 w-16 h-16 overflow-hidden">
              {customer?.customer?.image ? (
                <img src={customer.customer.image} alt="" className="w-full h-full object-cover" />
              ) : (
                customer?.customer?.name.charAt(0)
              )}
            </div>
            {isShopkeeper && (
              <button
                onClick={() => imageInputRef.current?.click()}
                disabled={imageUploading}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center shadow"
              >
                <Camera size={11} className="text-white" />
              </button>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCustomerImageUpload(f); }}
            />
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
          {staffPerms.canSendReminder && (
            <button
              className="flex items-center justify-center gap-1 flex-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-lg py-2 text-sm transition"
              onClick={() => setIsOpenRemainder(true)}
            >
              <MessageSquare size={16} />
              রিমাইন্ডার
            </button>
          )}

          <button
            onClick={() => window.open(`tel:${customer?.customer?.mobile}`)}
            className="flex items-center justify-center gap-1 flex-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-lg py-2 text-sm transition"
          >
            <Phone size={16} />
            কল
          </button>
        </div>

        {/* Request Access Toggle (Section 5) - Shopkeeper only */}
        {isShopkeeper && (
          <div className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">পেমেন্ট অনুরোধের সুবিধা</p>
              <p className="text-xs text-slate-500">{customer?.canRequestTxn ? "কাস্টমার পেমেন্ট অনুরোধ পাঠাতে পারবে" : "কাস্টমার অনুরোধ পাঠাতে পারবে না"}</p>
            </div>
            <button
              onClick={() => requestAccessMut.mutate()}
              disabled={requestAccessMut.isPending}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${customer?.canRequestTxn ? "bg-teal-500" : "bg-gray-200 dark:bg-slate-600"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${customer?.canRequestTxn ? "left-7" : "left-1"}`} />
            </button>
          </div>
        )}

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
        {(staffPerms.canAddBaki || staffPerms.canAddPayment) && (
          <button
            className="w-full bg-teal-500 hover:bg-teal-400 text-black font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition"
            onClick={() =>
              navigate(`${basePath}/calculator`, {
                state: { custId: id },
              })
            }
          >
            <Plus size={18} />
            হিসাব করুন
          </button>
        )}

        {/* Settle button (Section 4) - shopkeeper only, when balance===0 and not settled */}
        {isShopkeeper && customer?.balance === 0 && !customer?.isSettled && (
          <button
            onClick={() => settleMut.mutate()}
            disabled={settleMut.isPending}
            className="w-full border border-teal-400 dark:border-teal-700 text-teal-600 dark:text-teal-400 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold hover:bg-teal-50 dark:hover:bg-teal-950/30 transition disabled:opacity-60"
          >
            <CheckCircle2 size={16} />
            {settleMut.isPending ? "সেটল হচ্ছে..." : "হিসাব সমাপ্ত প্রতিপাদন করুন"}
          </button>
        )}

        {isShopkeeper && customer?.isSettled && (
          <div className="flex items-center justify-center gap-2 py-2 text-teal-600 dark:text-teal-400 text-sm">
            <CheckCircle2 size={16} />
            <span className="font-semibold">হিসাব সমাপ্ত</span>
            {customer?.settledAt && (
              <span className="text-slate-400 text-xs">• {new Date(customer.settledAt).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}</span>
            )}
          </div>
        )}

        {/* Report Fraud - Shopkeeper only */}
        {isShopkeeper && (
          <button
            onClick={() => {
              setFraudAmount(String(customer?.balance ?? ""));
              setShowFraudModal(true);
            }}
            className="w-full border border-red-300 dark:border-red-800 text-red-500 dark:text-red-400 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 transition"
          >
            <ShieldAlert size={16} />
            প্রতারক হিসেবে রিপোর্ট করুন
          </button>
        )}

        {/* Unlink customer (Section 3) - Shopkeeper only */}
        {isShopkeeper && (
          <button
            onClick={() => customer?.balance > 0 ? undefined : setShowUnlink(true)}
            disabled={customer?.balance > 0}
            title={customer?.balance > 0 ? "বাকি প্রথমে পরিশোধ করুন" : ""}
            className="w-full border border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <UserMinus size={16} />
            {customer?.balance > 0 ? "বাকি শেষ করুন (Remove সক্ষম)" : "Customer সরিয়ে দিন"}
          </button>
        )}
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

      {/* Unlink Confirmation */}
      {showUnlink && (
        <div className="fixed inset-0 bg-black/60 dark:bg-slate-950/80 z-50 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <UserMinus className="w-6 h-6 text-red-500" />
              <h3 className="font-bold text-gray-800 dark:text-white">{customer?.customer?.name} কে সরিয়ে দিতে চান?</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400">এই Customer আপনার দোকানের সাথে সংযোগ বিচ্ছিন্ন হবে।</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUnlink(false)}
                className="flex-1 py-3 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 font-bold rounded-xl text-sm"
              >বাতিল</button>
              <button
                onClick={() => unlinkMut.mutate()}
                disabled={unlinkMut.isPending}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl text-sm disabled:opacity-60"
              >{unlinkMut.isPending ? "হচ্ছে..." : "হ্যাঁ, সরিয়ে দিন"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Fraud Report Modal */}
      {showFraudModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-slate-950/80 z-50 flex items-end">
          <div className="bg-white dark:bg-slate-800 w-full rounded-t-2xl p-5 space-y-4 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-gray-800 dark:text-white">প্রতারণা রিপোর্ট</h3>
              </div>
              <button
                onClick={() => { setShowFraudModal(false); setFraudErr(""); setFraudType(""); setFraudDesc(""); setFraudAmount(""); }}
                className="text-gray-400 dark:text-slate-500 text-xl leading-none"
              >✕</button>
            </div>

            {fraudDone ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-3xl">✅</p>
                <p className="font-bold text-green-600 dark:text-green-400">রিপোর্ট সফলভাবে জমা হয়েছে</p>
                <p className="text-sm text-slate-500">কমিউনিটিকে ধন্যবাদ জানানো হচ্ছে।</p>
              </div>
            ) : (
              <>
                {/* Customer chip */}
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">
                    {customer?.customer?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{customer?.customer?.name}</p>
                    <p className="text-xs text-slate-500">{customer?.customer?.mobile}</p>
                  </div>
                </div>

                {/* Fraud type */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">সমস্যার ধরন বেছে নিন</p>
                  <div className="grid grid-cols-2 gap-2">
                    {FRAUD_TYPES.map((ft) => (
                      <button
                        key={ft.value}
                        onClick={() => setFraudType(ft.value)}
                        className={`text-xs font-semibold px-3 py-2.5 rounded-xl border-2 text-left transition ${
                          fraudType === ft.value
                            ? "border-red-500 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400"
                            : "border-gray-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {ft.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount (optional) */}
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 block">বাকির পরিমাণ (ঐচ্ছিক)</label>
                  <input
                    type="number"
                    value={fraudAmount}
                    onChange={(e) => setFraudAmount(e.target.value)}
                    placeholder="যেমন: ৫০০"
                    className="w-full bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-red-400"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5 block">বিস্তারিত (ঐচ্ছিক)</label>
                  <textarea
                    value={fraudDesc}
                    onChange={(e) => setFraudDesc(e.target.value)}
                    rows={3}
                    placeholder="যা ঘটেছে সংক্ষেপে লিখুন..."
                    className="w-full bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-red-400 resize-none"
                  />
                </div>

                {/* Anonymous toggle */}
                <button
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className="flex items-center gap-3 w-full"
                >
                  <div className={`relative w-11 h-6 rounded-full transition-colors ${isAnonymous ? "bg-red-500" : "bg-gray-200 dark:bg-slate-600"}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isAnonymous ? "left-6" : "left-1"}`} />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-300">পরিচয় গোপন রাখুন (Anonymous)</span>
                </button>

                {fraudErr && <p className="text-red-500 text-sm">{fraudErr}</p>}

                <button
                  onClick={() => { setFraudErr(""); fraudMut.mutate(customer?.customer?.id!); }}
                  disabled={!fraudType || fraudMut.isPending}
                  className="w-full py-3 bg-red-500 text-white font-bold rounded-xl text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <ShieldAlert size={16} />
                  {fraudMut.isPending ? "জমা হচ্ছে..." : "রিপোর্ট জমা দিন"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerViewPage;
