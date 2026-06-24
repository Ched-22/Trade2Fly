import { toolDisclaimerText } from '../../data/skydiverTools';

export function ToolDisclaimer() {
  return (
    <p className="mt-6 rounded-lg border border-nuvem bg-bruma/40 px-4 py-3 text-sm leading-relaxed text-cinza">
      {toolDisclaimerText}
    </p>
  );
}
