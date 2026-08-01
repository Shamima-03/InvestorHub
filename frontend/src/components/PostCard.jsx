import { Link } from 'react-router-dom';
import { ArrowRight, Eye, DollarSign, Tag } from 'lucide-react';

const CATEGORY_COLORS = {
  Technology: 'from-blue-500/20 to-cyan-500/20',
  Healthcare: 'from-green-500/20 to-emerald-500/20',
  Finance: 'from-yellow-500/20 to-amber-500/20',
  'Real Estate': 'from-purple-500/20 to-pink-500/20',
  Education: 'from-indigo-500/20 to-blue-500/20',
  Manufacturing: 'from-orange-500/20 to-red-500/20',
  Agriculture: 'from-green-500/20 to-lime-500/20',
  Energy: 'from-yellow-500/20 to-orange-500/20',
  Retail: 'from-pink-500/20 to-rose-500/20',
};

const CATEGORY_ICONS = {
  Technology: '💻',
  Healthcare: '🏥',
  Finance: '💰',
  'Real Estate': '🏢',
  Education: '📚',
  Manufacturing: '🏭',
  Agriculture: '🌾',
  Energy: '⚡',
  Retail: '🛒',
};

export default function PostCard({ post }) {
  const category = post.category?.[0] || 'Other';
  const gradientClass =
    CATEGORY_COLORS[category] || 'from-gray-500/20 to-slate-500/20';
  const icon = CATEGORY_ICONS[category] || '📋';

  return (
    <Link
      to={`/post/${post._id}`}
      className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-accent-green/30 hover:shadow-2xl hover:shadow-accent-green/5 transition-all duration-500 flex flex-col"
    >
      {/* Image / Gradient Header */}
      <div className="relative h-48 overflow-hidden">
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}
          >
            <span className="text-5xl opacity-60 group-hover:scale-110 transition-transform duration-500">
              {icon}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

        {/* Badges on image */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm ${
              post.type === 'investor_post'
                ? 'bg-accent-green/20 text-accent-green border border-accent-green/30'
                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
            }`}
          >
            {post.type === 'investor_post' ? 'Investor' : 'Business'}
          </span>
        </div>

        {post.budget > 0 && (
          <div className="absolute top-3 right-3">
            <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white border border-white/10 flex items-center gap-1">
              BDT{' '}
              {post.budget >= 1000
                ? `${(post.budget / 1000).toFixed(0)}K`
                : post.budget.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-accent-green/80 bg-accent-green/10 px-2.5 py-1 rounded-md border border-accent-green/10 flex items-center gap-1">
            <Tag size={10} />
            {category}
          </span>
          {post.category?.[1] && (
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-md border border-white/5">
              +{post.category.length - 1}
            </span>
          )}
        </div>

        <h3 className="font-bold text-base text-white group-hover:text-accent-green transition-colors line-clamp-2 mb-2 leading-snug">
          {post.title}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-2 flex-1 leading-relaxed">
          {post.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-green/20 to-accent-green/5 border border-accent-green/20 flex items-center justify-center text-xs font-bold text-accent-green">
              {post.authorId?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-medium text-white truncate max-w-[100px]">
                {post.authorId?.name}
              </p>
              <p className="text-[10px] text-gray-500">
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Eye size={12} />
            <span>{post.viewsCount || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
