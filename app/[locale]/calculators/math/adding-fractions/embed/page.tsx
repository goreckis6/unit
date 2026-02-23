import { AddingFractionsCalculator } from '../calculator';

/**
 * Embed view: calculator only, no header/footer. Used when iframing from admin-created pages.
 */
export default function AddingFractionsEmbedPage() {
  return (
    <div className="calculator-card" style={{ margin: 0 }}>
      <AddingFractionsCalculator />
    </div>
  );
}
