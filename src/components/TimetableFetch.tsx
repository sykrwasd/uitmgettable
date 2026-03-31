interface Props {
  matricNumber: string;
  setMatricNumber: (value: string) => void;
  onFetch: () => void
}

export default function TimetableFetch({
  matricNumber,
  setMatricNumber,
  onFetch
}: Props) {
  return (
    <>
      <input
        type="text"
        placeholder="Enter Matric Number"
        value={matricNumber}
        onChange={(e) => setMatricNumber(e.target.value)} 
        className="w-full mb-4 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 bg-white text-black"
      />

      <button
        onClick={onFetch} // example usage
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 transition-colors"
      >
        Fetch Timetable
      </button>
    </>
  );
}
