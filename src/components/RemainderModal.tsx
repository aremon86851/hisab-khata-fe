import { useState } from "react";
import { MessageCircle, Smartphone, Phone } from "lucide-react";

export default function ReminderModal() {
  const [method, setMethod] = useState("whatsapp");
  const [isEditing, setIsEditing] = useState(false);

  const phone = "8801313236929"; // بدون + (important)

  const [message, setMessage] = useState(
    "আসসালামু আলাইকুম, আপনার বাকি আছে ৳৮৮০ টাকা। অনুগ্রহ করে পরিশোধ করুন। - HisabKhata",
  );

  const [tempMessage, setTempMessage] = useState(message);

  const encodedMessage = encodeURIComponent(message);

  // 👉 Send handler
  const handleSend = () => {
    if (method === "whatsapp") {
      window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank");
    } else if (method === "sms") {
      window.open(`sms:${phone}?body=${encodedMessage}`);
    } else if (method === "call") {
      window.open(`tel:${phone}`);
    }
  };

  return (
    <div className="bg-slate-900 text-white space-y-5">
      {/* Title */}
      <h2 className="text-sm text-slate-400">রিমাইন্ডার মাধ্যম বেছে নিন</h2>

      {/* Options */}
      <div className="flex gap-3">
        {/* WhatsApp */}
        <div
          onClick={() => setMethod("whatsapp")}
          className={`flex-1 rounded-2xl p-3 text-center relative cursor-pointer transition
          ${
            method === "whatsapp"
              ? "bg-slate-800 border-2 border-teal-500"
              : "bg-slate-800"
          }`}
        >
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-teal-500 text-black px-2 py-[2px] rounded-full">
            RECOMMENDED
          </span>

          <div className="flex flex-col items-center gap-2">
            <MessageCircle size={28} className="text-teal-400" />
            <p className="text-sm font-medium">WhatsApp</p>
          </div>
        </div>

        {/* SMS */}
        <div
          onClick={() => setMethod("sms")}
          className={`flex-1 rounded-2xl p-3 text-center cursor-pointer transition
          ${
            method === "sms"
              ? "bg-slate-800 border-2 border-teal-500"
              : "bg-slate-800"
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <Smartphone size={28} className="text-slate-300" />
            <p className="text-sm">SMS</p>
          </div>
        </div>

        {/* Call */}
        <div
          onClick={() => setMethod("call")}
          className={`flex-1 rounded-2xl p-3 text-center cursor-pointer transition
          ${
            method === "call"
              ? "bg-slate-800 border-2 border-teal-500"
              : "bg-slate-800"
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <Phone size={28} className="text-slate-300" />
            <p className="text-sm">Call করুন</p>
          </div>
        </div>
      </div>

      {/* Message Header */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-400">মেসেজ প্রিভিউ</p>
        <button
          onClick={() => {
            // setTempMessage(message);
            if (isEditing) {
              setMessage(tempMessage);
            }
            setIsEditing(!isEditing);
          }}
          className="text-teal-400 text-sm"
        >
          {isEditing ? "সেইভ করুন" : "এডিট করুন"}
        </button>
      </div>

      {/* Message Box */}
      <div
        className={`bg-slate-800 rounded-2xl p-4 text-sm text-slate-200 leading-relaxed ${isEditing ? "border border-white" : ""}`}
        contentEditable={isEditing}
        autoFocus={isEditing}
        // suppressContentEditableWarning={true}
        onInput={(e) => setTempMessage(e.currentTarget.textContent)}
      >
        {message}
      </div>

      {/* CTA Button */}
      <button
        onClick={handleSend}
        className="w-full bg-teal-500 hover:bg-teal-400 text-black font-semibold py-3 rounded-xl transition"
      >
        {method === "whatsapp" && "WhatsApp এ পাঠান →"}
        {method === "sms" && "SMS পাঠান →"}
        {method === "call" && "কল করুন →"}
      </button>

      {/* Footer */}
      <p className="text-xs text-center text-slate-500">
        অটোমেটিক মেসেজ পাঠানো চার্জ প্রযোজ্য হতে পারে
      </p>

      {/* ✨ Edit Modal */}
      {/* {isEditing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 w-[90%] max-w-md rounded-2xl p-4 space-y-4">
            <h2 className="text-lg font-semibold">মেসেজ এডিট করুন</h2>

            <textarea
              value={tempMessage}
              onChange={(e) => setTempMessage(e.target.value)}
              className="w-full h-32 bg-slate-800 text-white p-3 rounded-lg outline-none resize-none"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-700 rounded-lg"
              >
                বাতিল
              </button>

              <button
                onClick={() => {
                  setMessage(tempMessage);
                  setIsEditing(false);
                }}
                className="px-4 py-2 bg-teal-500 text-black rounded-lg font-semibold"
              >
                সেভ করুন
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
