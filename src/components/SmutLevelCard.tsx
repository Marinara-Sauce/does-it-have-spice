import { RadioGroupItem } from './ui/radio-group';
import { useTheme } from '@/context/ThemeProvider';

interface SmutLevelCardProps {
  title: string;
  description: string;
  color: string;
  isSelectable?: boolean;
  selected?: boolean;
  value?: string;
}

export default function SmutLevelCard({
  title,
  description,
  color,
  isSelectable = false,
  selected = false,
  value,
}: Readonly<SmutLevelCardProps>) {
  const { theme } = useTheme();
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const CardContent = () => (
    <>
      <div className="flex items-center mb-2">
        <h3 className={`font-medium mb-2 ${color} flex-grow m-0`}>{title}</h3>
        {isSelectable && <RadioGroupItem value={value || ''} id={`radio-${value}`} />}
      </div>
      <p className={isDark ? 'text-gray-200' : 'text-gray-700'}>{description}</p>
    </>
  );

  if (isSelectable) {
    return (
      <label
        htmlFor={`radio-${value}`}
        className={`p-4 border rounded-lg block cursor-pointer transition-colors
          ${
            selected
              ? 'border-purple-500 ring-2 ring-purple-300 shadow-md'
              : isDark
                ? 'border-gray-700 hover:bg-gray-900'
                : 'hover:bg-slate-50'
          }
          ${isDark ? 'bg-black' : 'bg-white'}
        `}
      >
        <CardContent />
      </label>
    );
  }

  return (
    <div
      className={`p-4 border rounded-lg ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
    >
      <CardContent />
    </div>
  );
}
