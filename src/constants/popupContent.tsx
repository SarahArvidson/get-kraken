/**
 * Popup Content Constants
 *
 * TO EDIT FEATURE UPDATES:
 * - Change FEATURE_UPDATES_VERSION in src/constants.ts
 * - Change the return value of getFeatureUpdatesContent() below
 *
 * TO EDIT ABOUT CONTENT:
 * - Change the return value of getAboutContent() below
 */

export const getFeatureUpdatesContent = () => (
  <div className="space-y-4 text-gray-700 dark:text-gray-300">
    <p className="font-semibold text-lg">What's New:</p>
    <ul className="list-disc list-inside space-y-2 ml-2">
      <li>
        Front-side editing: Type amounts directly on quest and shop item cards
      </li>
      <li>
        Create with both currencies: Set sand dollars and dollars when creating
        items
      </li>
      <li>Improved mobile experience: Better layout on small screens</li>
    </ul>
  </div>
);

export const getAboutContent = () => (
  <div className="space-y-4 text-gray-700 dark:text-gray-300">
    <p>
      Get Kraken is a habit tracker designed for sea monsters, people named
      Sarah and Parth, and anyone who appreciates the ocean and wants to get
      stuff done.
    </p>
    <p>
      Complete quests to earn sand dollars, then spend them in the shop on
      rewards you've set for yourself.
    </p>
    <p className="text-sm text-gray-500 dark:text-gray-400">
      Track your progress, set goals, and build better habits one quest at a
      time.
    </p>
  </div>
);
