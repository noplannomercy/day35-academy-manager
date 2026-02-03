import { AlertCircle } from 'lucide-react';

interface ConflictWarningProps {
  message: string;
}

export default function ConflictWarning({ message }: ConflictWarningProps) {
  return (
    <div className="flex items-start gap-2 p-3 border border-red-500 bg-red-50 text-red-800 rounded-md">
      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
