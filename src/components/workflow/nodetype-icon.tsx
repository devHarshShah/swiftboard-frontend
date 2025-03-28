export default function NodeTypeIcon({ type }: { type: string }) {
  const getTypeBackgroundColor = () => {
    switch (type) {
      case "start":
        return "bg-green-100 text-green-600";
      case "end":
        return "bg-red-100 text-red-600";
      case "condition":
        return "bg-yellow-100 text-yellow-600";
      case "api":
        return "bg-purple-100 text-purple-600";
      case "data":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-indigo-100 text-indigo-600";
    }
  };

  return (
    <div className={`p-2 rounded-md ${getTypeBackgroundColor()}`}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 3V21M3 12H21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
