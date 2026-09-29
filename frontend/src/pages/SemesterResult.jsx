import { useEffect, useState } from "react";
import axios from "axios";
import "./../SemesterResult.css";

function SemesterResult() {
  const [result, setResult] = useState(null);
  const [semester, setSemester] = useState(8);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSemesterResult();
  }, [semester]);

  const loadSemesterResult = async () => {
    try {
      setError("");

      const response = await axios.get(
        `https://rs-management-vgcw.onrender.com/api/results/semester/${semester}`,
        {
          withCredentials: true,
        }
      );

      setResult(response.data.result);
    } catch (error) {
      setResult(null);
      setError(
        error.response?.data?.message || "Result not found"
      );
    }
  };

  return (
    <div className="semester-page">
      <div className="semester-container">

        <div className="semester-top">
          <div className="semester-selector">
            <label htmlFor="semester">Session :</label>

            <select
              id="semester"
              value={semester}
              onChange={(e) =>
                setSemester(Number(e.target.value))
              }
            >
              <option value={1}>Spring 2022</option>
              <option value={2}>Fall 2022</option>
              <option value={3}>Spring 2023</option>
              <option value={4}>Fall 2023</option>
              <option value={5}>Spring 2024</option>
              <option value={6}>Fall 2024</option>
              <option value={7}>Spring 2025</option>
              <option value={8}>Fall 2025</option>
            </select>
          </div>
        </div>

        <div className="result-history">
          <h2>Result History</h2>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          {result && (
            <>
              <div className="table-responsive">
                <table className="semester-result-table">
                  <thead>
                    <tr>
                      <th>COURSE</th>
                      <th>GRADE</th>
                      <th>GPA</th>
                    </tr>
                  </thead>

                  <tbody>
                    {result.subjects.map((subject, index) => (
                      <tr key={index}>
                        <td>
                          <span className="course-code">
                            [{subject.subjectCode}]
                          </span>{" "}
                          {subject.subjectName}
                        </td>

                        <td>{subject.grade}</td>

                        <td>
                          {Number(subject.gradePoint).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="semester-gpa">
                Semester GPA:{" "}
                <strong>
                  {Number(result.semesterGPA).toFixed(2)}
                </strong>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
  
export default SemesterResult;
