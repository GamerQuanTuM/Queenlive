import { Loader2 } from "lucide-react";
import type { JSX } from "react";

const LoadingSkeleton = (): JSX.Element => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center gap-y-5 flex flex-col items-center justify-center">
        <Loader2 className="text-primary size-10 animate-spin" />
        <p>Getting data from server...</p>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
