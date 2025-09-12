"use client";

const getValueClass = (value: number): string => {
  if (value > 0) return "text-red-400 font-medium";
  if (value < 0) return "text-green-400 font-medium";
  return "text-gray-400 font-medium";
};

const HighlightedText: React.FC<{ message: string }> = ({ message }) => {
  return (
    <span className="text-xs text-gray-300 leading-relaxed">
      {message.split(/(-?\d+\.?\d*%)/g).map((part, i) =>
        part.endsWith("%") ? (
          <span key={i} className={getValueClass(parseFloat(part))}>
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

export default HighlightedText;
