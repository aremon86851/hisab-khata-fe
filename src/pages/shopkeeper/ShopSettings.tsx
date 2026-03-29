import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Camera,
  Store,
  User,
  ChevronDown,
  Zap,
} from "lucide-react";

const DISTRICTS = [
  "ঢাকা",
  "চট্টগ্রাম",
  "রাজশাহী",
  "খুলনা",
  "বরিশাল",
  "সিলেট",
  "রংপুর",
  "ময়মনসিংহ",
];

export default function ShopVerificationPage() {
  const navigate = useNavigate();

  // Owner info
  const [ownerName, setOwnerName] = useState("");
  const [nidNumber, setNidNumber] = useState("");
  const [nidFront, setNidFront] = useState<File | null>(null);
  const [nidBack, setNidBack] = useState<File | null>(null);

  // Shop address
  const [district, setDistrict] = useState("ঢাকা");
  const [upazila, setUpazila] = useState("");
  const [address, setAddress] = useState("");

  // Shop photo
  const [shopPhoto, setShopPhoto] = useState<File | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Refs for file inputs
  const nidFrontRef = useRef<HTMLInputElement>(null);
  const nidBackRef = useRef<HTMLInputElement>(null);
  const shopPhotoRef = useRef<HTMLInputElement>(null);

  const getPreview = (file: File | null) =>
    file ? URL.createObjectURL(file) : null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!ownerName.trim()) e.ownerName = "মালিকের নাম আবশ্যক";
    if (!nidNumber.trim()) e.nidNumber = "NID নম্বর আবশ্যক";
    if (nidNumber.length !== 10 && nidNumber.length !== 17)
      e.nidNumber = "NID ১০ বা ১৭ ডিজিটের হতে হবে";
    if (!nidFront) e.nidFront = "NID সামনের ছবি আবশ্যক";
    if (!nidBack) e.nidBack = "NID পিছনের ছবি আবশ্যক";
    if (!upazila.trim()) e.upazila = "উপজেলা আবশ্যক";
    if (!address.trim()) e.address = "বিস্তারিত ঠিকানা আবশ্যক";
    if (!shopPhoto) e.shopPhoto = "দোকানের ছবি আবশ্যক";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("ownerName", ownerName);
      formData.append("nidNumber", nidNumber);
      formData.append("district", district);
      formData.append("upazila", upazila);
      formData.append("address", address);
      if (nidFront) formData.append("nidFront", nidFront);
      if (nidBack) formData.append("nidBack", nidBack);
      if (shopPhoto) formData.append("shopPhoto", shopPhoto);

      // TODO: replace with your API call
      // await shopApi.submitVerification(formData);

      await new Promise((r) => setTimeout(r, 1500)); // simulate
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── File Upload Box ──
  const UploadBox = ({
    label,
    file,
    inputRef,
    onChange,
    error,
  }: {
    label: string;
    file: File | null;
    inputRef: React.RefObject<HTMLInputElement>;
    onChange: (f: File) => void;
    error?: string;
  }) => (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onChange(e.target.files[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`w-full aspect-video border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-2 transition-colors overflow-hidden
          ${error ? "border-red-400 bg-red-50 dark:bg-red-950/30" : "border-teal-300 dark:border-teal-800 bg-teal-50 dark:bg-slate-700/50 hover:bg-teal-100 dark:hover:bg-slate-700"}`}
      >
        {file ? (
          <img
            src={getPreview(file)!}
            alt={label}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <>
            <Camera className="w-8 h-8 text-teal-500 mb-1" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {label}
            </span>
          </>
        )}
      </button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-slate-950 text-slate-900 dark:text-white pb-40">
      {/* Alert */}
      <div className="mx-4 mb-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 p-4 rounded-xl flex gap-3 items-start">
        <Zap className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-amber-700/80 dark:text-amber-400 text-sm">
            verification পরেও করা যাবে, তবে Verified হলে গ্রাহকের বিশ্বাস
            বাড়বে।
          </p>
        </div>
      </div>

      <main className="px-4 space-y-6">
        {/* Owner Info */}
        <section className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-teal-50 dark:border-slate-700 space-y-5">
          <h3 className="text-teal-600 font-bold flex items-center gap-2">
            <User className="w-5 h-5" /> মালিকের তথ্য
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-slate-700 dark:text-slate-200 font-medium mb-1.5 block">
                মালিকের নাম
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="এনআইডি অনুযায়ী নাম লিখুন"
                className={`w-full h-14 px-4 rounded-xl border text-lg outline-none focus:border-teal-500 bg-teal-50/50 dark:bg-slate-700 dark:text-white
                  ${errors.ownerName ? "border-red-400" : "border-teal-200 dark:border-slate-600"}`}
              />
              {errors.ownerName && (
                <p className="text-red-500 text-xs mt-1">{errors.ownerName}</p>
              )}
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-200 font-medium mb-1.5 block">
                NID নম্বর
              </label>
              <input
                type="number"
                value={nidNumber}
                onChange={(e) => setNidNumber(e.target.value)}
                placeholder="১০ অথবা ১৭ ডিজিটের নম্বর"
                className={`w-full h-14 px-4 rounded-xl border text-lg outline-none focus:border-teal-500 bg-teal-50/50 dark:bg-slate-700 dark:text-white
                  ${errors.nidNumber ? "border-red-400" : "border-teal-200 dark:border-slate-600"}`}
              />
              {errors.nidNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.nidNumber}</p>
              )}
            </div>
          </div>

          {/* NID Upload */}
          <div className="space-y-3 pt-2">
            <span className="text-slate-700 dark:text-slate-200 font-medium block">
              NID ছবি আপলোড করুন
            </span>
            <div className="grid grid-cols-2 gap-4">
              <UploadBox
                label="সামনের পাশ"
                file={nidFront}
                inputRef={nidFrontRef}
                onChange={setNidFront}
                error={errors.nidFront}
              />
              <UploadBox
                label="পিছনের পাশ"
                file={nidBack}
                inputRef={nidBackRef}
                onChange={setNidBack}
                error={errors.nidBack}
              />
            </div>
          </div>
        </section>

        {/* Shop Address */}
        <section className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-teal-50 dark:border-slate-700 space-y-5">
          <h3 className="text-teal-600 font-bold flex items-center gap-2">
            <Store className="w-5 h-5" /> দোকানের ঠিকানা
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-700 dark:text-slate-200 font-medium mb-1.5 block">
                জেলা
              </label>
              <div className="relative">
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full h-12 pl-4 pr-10 rounded-xl border border-teal-200 dark:border-slate-600 bg-teal-50/50 dark:bg-slate-700 dark:text-white outline-none focus:border-teal-500 appearance-none"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-slate-700 dark:text-slate-200 font-medium mb-1.5 block">
                উপজেলা
              </label>
              <input
                type="text"
                value={upazila}
                onChange={(e) => setUpazila(e.target.value)}
                placeholder="উপজেলা লিখুন"
                className={`w-full h-12 px-4 rounded-xl border outline-none focus:border-teal-500 bg-teal-50/50 dark:bg-slate-700 dark:text-white
                  ${errors.upazila ? "border-red-400" : "border-teal-200 dark:border-slate-600"}`}
              />
              {errors.upazila && (
                <p className="text-red-500 text-xs mt-1">{errors.upazila}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-slate-700 dark:text-slate-200 font-medium mb-1.5 block">
              বিস্তারিত ঠিকানা
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="রাস্তা নম্বর, বাড়ি নম্বর বা এলাকা"
              rows={3}
              className={`w-full px-4 py-3 rounded-xl border outline-none focus:border-teal-500 bg-teal-50/50 dark:bg-slate-700 dark:text-white resize-none
                ${errors.address ? "border-red-400" : "border-teal-200 dark:border-slate-600"}`}
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">{errors.address}</p>
            )}
          </div>
        </section>

        {/* Shop Photo */}
        <section className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-teal-50 dark:border-slate-700 flex flex-col items-center text-center space-y-4">
          <input
            ref={shopPhotoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && setShopPhoto(e.target.files[0])
            }
          />
          <button
            type="button"
            onClick={() => shopPhotoRef.current?.click()}
            className={`w-32 h-32 rounded-full border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-colors
              ${errors.shopPhoto ? "border-red-400 bg-red-50" : "border-teal-400 bg-teal-50 hover:bg-teal-100"}`}
          >
            {shopPhoto ? (
              <img
                src={getPreview(shopPhoto)!}
                alt="shop"
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-10 h-10 text-teal-500" />
            )}
          </button>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-white">
              আপনার দোকানের সামনের ছবি
            </h4>
            <p className="text-sm text-slate-500">
              পরিষ্কার ছবি ভেরিফিকেশন দ্রুত করে
            </p>
          </div>
          {errors.shopPhoto && (
            <p className="text-red-500 text-xs">{errors.shopPhoto}</p>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-teal-100 dark:border-slate-700 p-4 space-y-3">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-[60px] bg-teal-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-teal-200 active:scale-[0.98] transition-all disabled:opacity-70"
        >
          {loading ? "জমা হচ্ছে..." : "যাচাইয়ের জন্য জমা দিন"}
          {!loading && <Send className="w-5 h-5" />}
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full py-2.5 text-slate-500 dark:text-slate-400 font-semibold hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          এখন না, পরে করব
        </button>
      </footer>
    </div>
  );
}
