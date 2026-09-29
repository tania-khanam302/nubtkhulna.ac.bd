import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./../OverallResult.css";
import headerLogo from "../images/header-logo.png";

function ResultSearch() {
  const navigate = useNavigate();

  const API_URL = "https://rs-management-vgcw.onrender.com";

  const [student, setStudent] = useState(null);
  const [results, setResults] = useState([]);
  const [cgpa, setCgpa] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // load student result
  useEffect(() => {
    loadStudentResult();
  }, []);

  // logout
  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_URL}/api/students/logout`,
        {},
        {
          withCredentials: true,
        },
      );
    } catch (err) {
      console.log("Logout Error:", err);
    }

    localStorage.removeItem("student");
    navigate("/");
  };

  // get student profile and result
  const loadStudentResult = async () => {
    try {
      setLoading(true);
      setError("");

      const studentResponse = await axios.get(
        `${API_URL}/api/students/profile`,
        {
          withCredentials: true,
        },
      );

      console.log("Student:", studentResponse.data);

      const studentData = studentResponse.data?.student;

      if (!studentData) {
        throw new Error("Student information not found.");
      }

      setStudent(studentData);

      const resultResponse = await axios.get(
        `${API_URL}/api/results/my-results`,
        {
          withCredentials: true,
        },
      );

      console.log("Results:", resultResponse.data);

      setResults(resultResponse.data?.results || []);

      const cgpaResponse = await axios.get(
        `${API_URL}/api/results/cgpa`,
        {
          withCredentials: true,
        },
      );

      console.log("CGPA:", cgpaResponse.data);

      setCgpa(cgpaResponse.data);
    } catch (error) {
      console.log(
        "Result Loading Error:",
        error.response?.data,
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load your result. Please login again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // check all 8 semesters
  const allSemestersCompleted = [1, 2, 3, 4, 5, 6, 7, 8].every(
    (semesterNumber) =>
      results.some(
        (result) =>
          Number(result.semester) === semesterNumber,
      ),
  );

  // =========================================================
  // DOWNLOAD RESULT PDF
  // =========================================================

  const downloadResultPDF = () => {
    if (!student || !cgpa || results.length === 0) {
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // =====================================================
    // STUDENT INFORMATION
    // Only these 4 information will show in PDF
    // =====================================================

    doc.setTextColor(0, 0, 0);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    // First row
    doc.text(
      `Student ID: ${student.studentId || ""}`,
      15,
      15,
    );

    doc.text(
      `Name: ${student.name || ""}`,
      110,
      15,
    );

    // Second row
    doc.text(
      `Department: ${student.department || ""}`,
      15,
      22,
    );

    doc.text(
      `Academic Year: ${student.year || ""}`,
      110,
      22,
    );

    // =====================================================
    // RESULT TABLE SETTINGS
    // CSS-এর মতো compact রাখা হয়েছে
    // =====================================================

    const tableHead = [
      [
        "Sl",
        "Course Code",
        "Course Title",
        "Cr.Hr",
        "Grade",
        "Point",
        "G.P",
      ],
    ];

    const tableStyles = {
      fontSize: 8,
      cellPadding: 2,
      valign: "middle",
      lineColor: [221, 221, 221],
      lineWidth: 0.3,
      textColor: [0, 0, 0],
      overflow: "linebreak",
    };

    const tableHeadStyles = {
      fillColor: [133, 134, 138],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      cellPadding: 2,
    };

    const tableColumnStyles = {
      0: {
        cellWidth: 10,
        halign: "center",
      },

      1: {
        cellWidth: 28,
        halign: "center",
      },

      2: {
        cellWidth: 65,
        halign: "left",
      },

      3: {
        cellWidth: 20,
        halign: "center",
      },

      4: {
        cellWidth: 20,
        halign: "center",
      },

      5: {
        cellWidth: 20,
        halign: "center",
      },

      6: {
        cellWidth: 22,
        halign: "center",
      },
    };

    // =====================================================
    // FIRST TABLE HEADER
    // =====================================================

    let currentY = 30;

    autoTable(doc, {
      startY: currentY,

      head: tableHead,

      body: [],

      theme: "grid",

      margin: {
        left: 15,
        right: 15,
      },

      styles: tableStyles,

      headStyles: tableHeadStyles,

      columnStyles: tableColumnStyles,
    });

    currentY = doc.lastAutoTable.finalY + 5;

    // =====================================================
    // EACH SEMESTER
    // =====================================================

    results.forEach((semesterResult) => {
      // ---------------------------------------------------
      // Check page space
      // ---------------------------------------------------

      if (currentY > 255) {
        doc.addPage();

        currentY = 15;

        // Table header on new page
        autoTable(doc, {
          startY: currentY,

          head: tableHead,

          body: [],

          theme: "grid",

          margin: {
            left: 15,
            right: 15,
          },

          styles: tableStyles,

          headStyles: tableHeadStyles,

          columnStyles: tableColumnStyles,
        });

        currentY = doc.lastAutoTable.finalY + 5;
      }

      // ---------------------------------------------------
      // Semester header
      // ---------------------------------------------------

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);

      doc.text(
        `Semester ${semesterResult.semester}`,
        15,
        currentY,
      );

      const session =
        semesterResult.session ||
        semesterResult.academicSession ||
        semesterResult.semesterYear ||
        "";

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);

      doc.text(
        session,
        195,
        currentY,
        {
          align: "right",
        },
      );

      currentY += 3;

      // ---------------------------------------------------
      // Subjects
      // ---------------------------------------------------

      const subjectRows = (
        semesterResult.subjects || []
      ).map((subject, index) => {
        const credit = Number(subject.credit) || 0;

        const point =
          Number(subject.gradePoint) || 0;

        const gp = credit * point;

        return [
          index + 1,
          subject.subjectCode || "",
          subject.subjectName || "",
          credit.toFixed(2),
          subject.grade || "",
          point.toFixed(2),
          gp.toFixed(2),
        ];
      });

      autoTable(doc, {
        startY: currentY,

        head: [],

        body: subjectRows,

        theme: "grid",

        margin: {
          left: 15,
          right: 15,
        },

        styles: tableStyles,

        columnStyles: tableColumnStyles,

        pageBreak: "auto",

        didDrawPage: () => {
          // Nothing extra here
        },
      });

      currentY = doc.lastAutoTable.finalY + 4;

      // ---------------------------------------------------
      // Semester GPA
      // ---------------------------------------------------

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);

      doc.text(
        `Semester GPA: ${Number(
          semesterResult.semesterGPA || 0,
        ).toFixed(2)}`,
        195,
        currentY,
        {
          align: "right",
        },
      );

      currentY += 8;
    });

    // =====================================================
    // CGPA
    // =====================================================

    if (cgpa) {
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);

      doc.text(
        `CGPA: ${Number(
          cgpa.cgpa || 0,
        ).toFixed(3)}`,
        195,
        currentY,
        {
          align: "right",
        },
      );
    }

    // =====================================================
    // SAVE PDF
    // =====================================================

    doc.save(
      `${student.studentId}-Result.pdf`,
    );
  };

  // =========================================================
  // DOWNLOAD CERTIFICATE
  // =========================================================

  const downloadCertificate = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/students/certificate/download`,
        {
          withCredentials: true,
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `${student.studentId}-Certificate.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log(
        "Certificate Error:",
        error.response?.data,
      );

      alert(
        "Certificate is not available yet.",
      );
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="result-page">
        <div className="container">
          <div className="loading">
            Loading your result...
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="result-page">
        <div className="container">
          <div className="error">
            {error}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // NO STUDENT
  // =========================================================

  if (!student) {
    return (
      <div className="result-page">
        <div className="container">
          <div className="error">
            Student information not found.
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN RESULT PAGE
  // =========================================================

  return (
    <div className="result-page">
      <div className="container">

        {/* Student Information */}

        <div className="student-card">
          <div className="student-info">

            <p>
              <strong>
                Student ID:
              </strong>{" "}
              {student.studentId}
            </p>

            <p>
              <strong>
                Department:
              </strong>{" "}
              {student.department}
            </p>

            <p>
              <strong>
                Name:
              </strong>{" "}
              {student.name}
            </p>

            <p>
              <strong>
                Academic Year:
              </strong>{" "}
              {student.year}
            </p>

          </div>
        </div>

        {/* Common Table Header */}

        <table className="result-table">
          <thead>
            <tr>

              <th className="sl-column">
                Sl
              </th>

              <th className="course-code-th">
                Course Code
              </th>

              <th className="course-title-th">
                Course Title
              </th>

              <th className="cr-th">
                Cr.Hr
              </th>

              <th className="grade-th">
                Grade
              </th>

              <th className="point-th">
                Point
              </th>

              <th className="gp-th">
                G.P
              </th>

            </tr>
          </thead>
        </table>

        {/* All Semesters */}

        {results.map((semesterResult) => (
          <div
            className="semester-section"
            key={semesterResult._id}
          >

            {/* Semester Header */}

            <div className="semester-header">

              <strong>
                Semester{" "}
                {semesterResult.semester}
              </strong>

              <span>
                {semesterResult.session ||
                  semesterResult.academicSession ||
                  semesterResult.semesterYear ||
                  ""}
              </span>

            </div>

            {/* Semester Subjects */}

            <table className="result-table">
              <tbody>

                {semesterResult.subjects.map(
                  (subject, index) => {

                    const gp =
                      Number(subject.credit) *
                      Number(subject.gradePoint);

                    return (
                      <tr key={index}>

                        <td className="sl-column-td">
                          {index + 1}
                        </td>

                        <td className="course-code-td">
                          {subject.subjectCode}
                        </td>

                        <td className="course-title">
                          {subject.subjectName}
                        </td>

                        <td>
                          {Number(
                            subject.credit,
                          ).toFixed(2)}
                        </td>

                        <td>
                          {subject.grade}
                        </td>

                        <td>
                          {Number(
                            subject.gradePoint,
                          ).toFixed(2)}
                        </td>

                        <td>
                          {gp.toFixed(2)}
                        </td>

                      </tr>
                    );
                  },
                )}

              </tbody>
            </table>

            {/* GPA */}

            <div className="gpa-box">

              <div className="gpa result-semester-gpa">

                Semester GPA:{" "}

                <strong>
                  {Number(
                    semesterResult.semesterGPA,
                  ).toFixed(2)}
                </strong>

              </div>

            </div>

          </div>
        ))}

        {/* Academic Summary */}

        {cgpa && (
          <div className="cgpa-card">

            <div className="summary-grid">

              <div className="overall-cgpa">

                <span>
                  CGPA:
                </span>

                <strong>
                  {Number(
                    cgpa.cgpa,
                  ).toFixed(3)}
                </strong>

              </div>

            </div>

          </div>
        )}

        {/* Course Completed */}

        {student.courseCompleted === true &&
          allSemestersCompleted && (

            <div className="certificate-section">

              <h3>
                🎓 Course Completed
              </h3>

              <p>
                Congratulations! You have
                successfully completed all 8
                semesters.
              </p>

              <button
                className="certificate-button"
                onClick={downloadCertificate}
              >
                🎓 DOWNLOAD CERTIFICATE
              </button>

            </div>

          )}

        {/* Course In Progress */}

        {!allSemestersCompleted && (

          <div className="progress-section">

            <h3>
              📚 Course In Progress
            </h3>

            <p>
              You have completed{" "}
              <strong>
                {results.length}
              </strong>{" "}
              out of 8 semesters.
            </p>

            <p>
              Certificate will be available
              after completing all 8 semesters.
            </p>

          </div>

        )}

        {/* Download Button */}

        <div className="result-actions">

          <button
            className="print-button"
            onClick={downloadResultPDF}
          >
            📄 DOWNLOAD RESULT PDF
          </button>

        </div>

      </div>
    </div>
  );
}

export default ResultSearch;
