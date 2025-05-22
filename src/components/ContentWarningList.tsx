
import { AlertTriangle } from 'lucide-react';

interface ContentWarningListProps {
  locations: string[] | string;
}

const ContentWarningList = ({ locations }: ContentWarningListProps) => {
  if (!locations || (Array.isArray(locations) && locations.length === 0)) return null;

  // Handle both string and array format for backward compatibility
  const warningList = Array.isArray(locations) ? locations.map(item => item.trim()) : 
    locations.split(',').map(item => item.trim());

  return (
    <div className="mt-4 p-3 bg-muted rounded-md">
      <div className="flex gap-2 items-center mb-2 text-sm font-medium">
        <AlertTriangle size={16} className="text-amber-500" />
        <span>Content to avoid:</span>
      </div>
      <ul className="list-disc list-inside space-y-1">
        {warningList.map((warning, index) => (
          <li key={index} className="text-sm text-muted-foreground">
            {warning}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContentWarningList;
