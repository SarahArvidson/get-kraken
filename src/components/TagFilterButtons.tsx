/**
 * Get Kraken - Tag Filter Buttons Component
 *
 * Reusable component for filtering by tags (quests or shop items)
 */

interface TagFilterButtonsProps<T extends string> {
  tags: T[];
  selectedTag: T | null;
  onTagSelect: (tag: T | null) => void;
  getLabel: (tag: T) => string;
  getButtonClasses: (tag: T) => { base: string; active: string };
}

export function TagFilterButtons<T extends string>({
  tags,
  selectedTag,
  onTagSelect,
  getLabel,
  getButtonClasses,
}: TagFilterButtonsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => onTagSelect(null)}
        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
          selectedTag === null
            ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
        }`}
      >
        All
      </button>
      {tags.map((tag) => {
        const classes = getButtonClasses(tag);
        const isActive = selectedTag === tag;
        return (
          <button
            key={tag}
            onClick={() => onTagSelect(isActive ? null : tag)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              isActive ? classes.active : classes.base
            }`}
          >
            {getLabel(tag)}
          </button>
        );
      })}
    </div>
  );
}

