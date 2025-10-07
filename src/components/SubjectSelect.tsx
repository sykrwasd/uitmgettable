
import Select from "react-select";

type Subject = {
  course: string;
  href: string;
};

interface SubjectProps {
  loadingSubjects: boolean;
  fetchSubjects: Subject[];
  setSubjectName: (value: string) => void
}



export default function SubjectSelect({
loadingSubjects,
fetchSubjects,
setSubjectName
}: SubjectProps) {
  return (
    <>
      {loadingSubjects && (
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Select
            options={fetchSubjects.map((row) => ({
              value: row.course,
              label: row.course,
            }))}
            onChange={(selected) => setSubjectName(selected?.value ?? "")}
            placeholder="Select Subject"
            className="w-full "
            menuPortalTarget={document.body}
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }), 
            }}
          />
        </div>
      )}
    </>
  );
}
