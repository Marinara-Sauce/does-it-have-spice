import { RadioGroupItem } from "./ui/radio-group";

interface SmutLevelCardProps {
    title: string;
    description: string;
    color: string;
    isSelectable: boolean;
    selected: boolean;
    value: string;
}

export default function SmutLevelCard({
    title,
    description,
    color,
    isSelectable,
    selected,
    value,
}: Readonly<SmutLevelCardProps>) {
    return (
      <div className="p-4 border rounded-lg">
        <div className="flex items-center mb-2">
          <h3 className={`font-medium mb-2 ${color} flex-grow m-0`}>{title}</h3>
          {isSelectable ? <RadioGroupItem value={value} /> : null}
        </div>
        <p>{description}</p>
      </div>
    )
}