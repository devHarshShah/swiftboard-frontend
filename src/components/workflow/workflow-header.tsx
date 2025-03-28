interface WorkflowHeaderProps {
  name: string;
  setName: (name: string) => void;
}

export default function WorkflowHeader({ name, setName }: WorkflowHeaderProps) {
  return (
    <div>
      <input
        type="text"
        placeholder="Workflow Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="px-4 py-2 w-48 text-sm bg-transparent font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
      />
    </div>
  );
}
