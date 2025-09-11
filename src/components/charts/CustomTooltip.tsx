export const CustomTooltip = ({ active, payload, label, isPie }: any) => {
  if (active && payload && payload.length) {
    const name = label || payload[0].name;
    return (
      <div className="bg-gray-800 text-gray-300 p-2 rounded-lg border border-gray-600 shadow-md">
        <p className="text-sm font-medium">{`Region: ${name}`}</p>
        {isPie ? (
          <p className="text-sm">{`Cost: $${payload[0].value.toFixed(2)}`}</p>
        ) : (
          <p className="text-sm">{`Cost: $${payload[0].value.toFixed(2)}`}</p>
        )}
      </div>
    );
  }
  return null;
};
