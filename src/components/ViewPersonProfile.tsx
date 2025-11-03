import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Person } from "../types";

interface Props {
  person: Person;
  onClose: () => void;
}

const ViewPersonProfile: React.FC<Props> = ({ person, onClose }) => {
    const skills = person.skills ?? [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div className="text-center">
          <img
            src={person.avatar}
            alt={`${person.firstName} ${person.lastName}`}
            className="h-24 w-24 rounded-full mx-auto object-cover mb-4"
          />

          <h2 className="text-2xl font-semibold text-gray-900">
            {person.firstName} {person.lastName}
          </h2>
          <p className="text-gray-600">{person.position} @ {person.company}</p>
          <p className="text-gray-500 text-sm mb-4">{person.location}</p>

          {person.bio && <p className="text-gray-700 mb-4">{person.bio}</p>}
          {skills.length > 0 && (
  <div className="flex flex-wrap justify-center gap-2 mt-3">
    {skills.map((skill, i) => (
      <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
        {skill}
      </span>
    ))}
  </div>
)}
         
        </div>

        <div className="mt-6 flex justify-center">
          <button className="bg-linkedin-blue text-white px-6 py-2 rounded-lg font-medium hover:bg-linkedin-darkBlue">
            Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPersonProfile;
