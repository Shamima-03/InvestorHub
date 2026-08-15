import { Link } from "react-router-dom";
import { Eye, Tag } from "lucide-react";

export default function PostCard({ post }) {
  const category = post.category?.[0] || "Other";
  const isInvestor = post.type === "investor_post";

  return (
    <Link
      to={`/post/${post._id}`}
      className="group flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-emerald-200 hover:shadow-sm transition-all"
    >
      <div className="relative h-44 bg-slate-100 overflow-hidden">
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Tag size={32} />
          </div>
        )}
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-md ${
            isInvestor
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-slate-800 text-white"
          }`}
        >
          {isInvestor ? "Investor" : "Business"}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium text-slate-600 bg-slate-50 border border-gray-200 px-2 py-0.5 rounded">
            {category}
          </span>
          {post.budget > 0 && (
            <span className="text-xs font-medium text-slate-700">
              BDT {Number(post.budget).toLocaleString()}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
          {post.title}
        </h3>
        <p className="mt-2 text-sm text-slate-600 line-clamp-2 flex-1 leading-relaxed">
          {post.description}
        </p>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center justify-center shrink-0">
              {post.authorId?.name?.charAt(0)?.toUpperCase()}
            </div>
            <p className="text-sm text-slate-700 truncate">{post.authorId?.name}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
            <Eye size={13} />
            {post.viewsCount || 0}
          </div>
        </div>
      </div>
    </Link>
  );
}
