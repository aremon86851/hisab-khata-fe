const Modal = ({ setConfirm, title, children }: any) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 flex items-end justify-center"
      onClick={() => setConfirm(null)}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-t-2xl w-full max-w-md p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-white font-bold text-base mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
};

export default Modal;
