import Paragraph from "@/components/ui/Paragraph";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <Paragraph>Loading your files</Paragraph>
      <Loader2 className="h-10 w-10 animate-spin dark:text-slate-200" />
    </div>
  );
}
