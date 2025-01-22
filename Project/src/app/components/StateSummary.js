import { useContext, useMemo } from "react";
import { MapContext } from "../context/MapContext";
import { FaSkullCrossbones, FaUserInjured } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { ImCross } from "react-icons/im";

export default function StateSummary() {
  const {
    incidentMarkers,
    selectedStateName,
    selectedYear,
    setSelectedStateName,
  } = useContext(MapContext);

  const { killed, injured } = useMemo(() => {
    let totals = { killed: 0, injured: 0 };
    incidentMarkers.forEach((inc) => {
      if (inc.state === selectedStateName) {
        totals.killed += inc.killed;
        totals.injured += inc.injured;
      }
    });
    return totals;
  }, [incidentMarkers, selectedStateName]);

  if (!selectedStateName) return null;

  return (
    <div className="relative p-4 mt-3 bg-white border border-gray-300 rounded-lg shadow-lg ">
      {/* Close button */}
      <button
        onClick={() => setSelectedStateName("")}
        className="absolute flex items-center justify-center w-5 h-5 p-1.5 text-white transition-all duration-200 ease-in-out bg-red-500 rounded-full shadow-md top-2 right-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
        aria-label="Close Summary"
      >
        <ImCross className="text-xs font-bold" />
      </button>

      <h3 className="my-3 font-bold tracking-wide text-center text-gray-800 uppercase textmd">
        {selectedStateName}{" "}
        <span className="text-gray-500">({selectedYear})</span>
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center p-3 bg-red-100 border border-red-300 rounded-md">
          <FaSkullCrossbones className="mb-1 text-2xl text-red-600" />
          <span className="font-medium text-gray-700 text-md">Killed</span>
          <span className="text-2xl font-bold text-red-800">{killed}</span>
        </div>

        <div className="flex flex-col items-center p-3 bg-yellow-100 border border-yellow-300 rounded-md">
          <FaUserInjured className="mb-1 text-2xl text-yellow-600" />
          <span className="font-medium text-gray-700 text-md">Injured</span>
          <span className="text-2xl font-bold text-yellow-800">{injured}</span>
        </div>
      </div>
    </div>
  );
}
