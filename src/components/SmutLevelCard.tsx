import { RadioGroupItem } from "./ui/radio-group";

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
  const CardContent = () => (
    <>
      <div className="flex items-center mb-2">
        <h3 className={`font-medium mb-2 ${color} flex-grow m-0`}>{title}</h3>
        {isSelectable && <RadioGroupItem value={value} id={`radio-${value}`} />}
      </div>
      <p>{description}</p>
    </>
  );

  if (isSelectable) {
    return (
      <label 
        htmlFor={`radio-${value}`} 
        className={`p-4 border rounded-lg block cursor-pointer hover:bg-slate-50 transition-colors
          ${selected ? 'border-purple-500 ring-2 ring-purple-300 shadow-md' : ''}
        `}
      >
        <CardContent />
      </label>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <CardContent />
    </div>
  );
}