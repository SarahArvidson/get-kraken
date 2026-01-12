/**
 * Get Kraken v2 - How to Use Page
 * 
 * Content page with clear instructions
 */

export function HowToUsePage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        How to Use Get Kraken
      </h1>
      <div className="prose dark:prose-invert space-y-4 text-gray-700 dark:text-gray-300">
        <p>
          Get Kraken is a habit tracker designed for sea monsters, people named
          Sarah and Parth, and anyone who appreciates the ocean and wants to get
          stuff done.
        </p>
        <ul className="list-disc list-inside space-y-2">
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
        </ul>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Use it however you want to; it's yours.
        </p>
      </div>
    </div>
  );
}
