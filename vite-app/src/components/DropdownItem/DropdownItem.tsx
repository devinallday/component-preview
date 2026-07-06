import type { DropdownItem as DropdownItemType } from "../../types";

interface DropdownItemProps<T = any> {
  item: DropdownItemType<T>;
  isFocused: boolean;
  onSelect: (value: T, item: DropdownItemType<T>) => void;
}

const DropdownItem = <T,>({
  item,
  isFocused,
  onSelect,
}: DropdownItemProps<T>) => {
  const handleClick = () => {
    if (!item.disabled) {
      onSelect(item.value, item);
    }
  };

  if (item.separator) {
    return <div className="h-px bg-spotify-gray-600 my-1 mx-2" />;
  }

  return (
    <button
      className={`w-full flex items-center gap-3 px-3 py-2 text-left text-white text-sm transition-colors duration-150 ${
        item.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"
      } ${isFocused ? "bg-white/10" : ""}`}
      onClick={handleClick}
      disabled={item.disabled}
      role="menuitem"
      tabIndex={-1}
    >
      {item.icon && (
        <span className="text-base flex-shrink-0">{item.icon}</span>
      )}
      <span className="flex-1">{item.label}</span>
    </button>
  );
};

export default DropdownItem;
