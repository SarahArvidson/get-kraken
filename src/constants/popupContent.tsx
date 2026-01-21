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
        Quests include tasks and habits if you want them.
      </li>
      <li>You can tie specific reward items to specific quests.</li>
      <li>The UI should be more balanced on very small screens.</li>
    </ul>
    <p className="font-semibold text-lg">Next in Development:</p>
    <ul className="list-disc list-inside space-y-2 ml-2">
      <li>Refining the rewards area.</li>
      <li>Implementing social features.</li>
      <li>Making the light/dark mode toggle work.</li>
      <li>Improving the search bar, which is terrible.</li>
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
      <ul>
        <li>
          Create and complete quests to earn currency that you can spend in your
          own reward shop.
        </li>
        <li>
          If a quest doesn't actually save you any money, give it value in sand
          dollars.
        </li>
        <li>
          If a quest really helps you save money, like skipping a latte, give it
          a reasonable dollar value.
        </li>
        <li>
          Later on, you can spend the money you saved on things that cost real
          money.
        </li>

        <li>
          If a quest genuinely helps you save money, like skipping a latte, give
          it a reasonable dollar value. Later on, you can spend the money you
          saved on things that cost real money.
        </li>
      </ul>
    </p>
    <p className="text-sm text-gray-500 dark:text-gray-400">
      Use it however you want to; it's yours.
    </p>
  </div>
);
