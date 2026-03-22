const CustomerViewSkeleton = () => {
  return (
    <div className="p-4 space-y-4 bg-slate-900 animate-pulse">
      {/* Header */}
      <div className="flex flex-col items-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-slate-700" />
        <div className="h-4 w-32 bg-slate-700 rounded" />
        <div className="h-3 w-24 bg-slate-700 rounded" />

        <div className="flex gap-1 mt-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-slate-700 rounded" />
          ))}
        </div>
      </div>

      {/* Due Card */}
      <div className="bg-slate-800 rounded-xl p-4 text-center space-y-2">
        <div className="h-3 w-24 bg-slate-700 mx-auto rounded" />
        <div className="h-5 w-32 bg-slate-700 mx-auto rounded" />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <div className="flex-1 h-10 bg-slate-800 rounded-lg" />
        <div className="flex-1 h-10 bg-slate-800 rounded-lg" />
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="h-4 w-24 bg-slate-700 rounded" />
        <div className="h-4 w-16 bg-slate-700 rounded" />
      </div>

      {/* List */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex justify-between items-center bg-slate-800 rounded-xl p-3"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-slate-700 rounded" />
            <div className="space-y-1">
              <div className="h-3 w-24 bg-slate-700 rounded" />
              <div className="h-2 w-32 bg-slate-700 rounded" />
            </div>
          </div>
          <div className="h-3 w-12 bg-slate-700 rounded" />
        </div>
      ))}

      {/* Button */}
      <div className="h-12 bg-slate-700 rounded-xl" />
    </div>
  );
};

export default CustomerViewSkeleton;
