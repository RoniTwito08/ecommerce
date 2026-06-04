import SkeletonCard from './SkeletonCard';

export default function SkeletonGrid({ count = 8 }) {
  return (
    <div className="pgrid">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}
