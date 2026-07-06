import React, { useState, useRef, useEffect, useCallback } from "react";
import type { DropdownItem, DropdownProps } from "../../types";
import DropdownItemComponent from "../DropdownItem/DropdownItem";

interface DropdownComponentProps<T = any> extends DropdownProps<T> {
  trigger: React.ReactNode;
}

const Dropdown = <T,>({
  trigger,
  items,
  onSelect,
  align = "left",
  className = "",
  onClose,
}: DropdownComponentProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
    setFocusedIndex(-1);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
    onClose?.();
  }, [onClose]);

  const handleItemSelect = useCallback(
    (value: T, item: DropdownItem<T>) => {
      if (!item.disabled) {
        onSelect(value, item);
        handleClose();
      }
    },
    [onSelect, handleClose],
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      const validItems = items.filter(
        (item) => !item.disabled && !item.separator,
      );

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          handleClose();
          triggerRef.current?.focus();
          break;
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) => {
            const nextIndex = prev < validItems.length - 1 ? prev + 1 : 0;
            return nextIndex;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => {
            const nextIndex = prev > 0 ? prev - 1 : validItems.length - 1;
            return nextIndex;
          });
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < validItems.length) {
            handleItemSelect(
              validItems[focusedIndex].value,
              validItems[focusedIndex],
            );
          }
          break;
        case "Tab":
          handleClose();
          break;
      }
    },
    [isOpen, items, focusedIndex, handleClose, handleItemSelect],
  );

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose, handleKeyDown]);

  const validItems = items.filter((item) => !item.disabled && !item.separator);

  const getMenuAlignment = () => {
    switch (align) {
      case "right":
        return "right-0";
      case "center":
        return "left-1/2 transform -translate-x-1/2";
      case "left":
      default:
        return "left-0";
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        ref={triggerRef}
        className="bg-transparent border-none p-0 cursor-pointer"
        onClick={handleToggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Open menu"
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          className={`absolute top-full ${getMenuAlignment()} mt-2 bg-spotify-gray-700 border border-spotify-gray-600 rounded-lg shadow-2xl min-w-48 py-1 z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200`}
          role="menu"
          aria-orientation="vertical"
        >
          {items.map((item) => {
            const validIndex = validItems.findIndex(
              (validItem) => validItem.id === item.id,
            );
            const isFocused = validIndex === focusedIndex;

            return (
              <DropdownItemComponent
                key={item.id}
                item={item}
                isFocused={isFocused}
                onSelect={handleItemSelect}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
