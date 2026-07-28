const API = {
  students: "/api/students",
  courses: "/api/courses",
  faculty: "/api/faculty",
  sections: "/api/sections",
  enrollments: "/api/enrollments"
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showMessage(elementId, message, isError = false) {
  const element = document.getElementById(elementId);

  element.textContent = message;
  element.style.color = isError ? "#b62946" : "#c43277";
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);

  let result;

  try {
    result = await response.json();
  } catch {
    result = {};
  }

  if (!response.ok) {
    throw new Error(
      result.error ||
      result.details ||
      "The request could not be completed."
    );
  }

  return result;
}

// --------------------------------------------------
// NAVIGATION
// --------------------------------------------------

function showSection(sectionId) {
  const sectionIds = [
    "welcome",
    "students",
    "courses",
    "faculty",
    "sections",
    "enrollments"
  ];

  sectionIds.forEach((id) => {
    document.getElementById(id).classList.add("hidden");
  });

  document.getElementById(sectionId).classList.remove("hidden");

  if (sectionId === "students") {
    loadStudents();
  }

  if (sectionId === "courses") {
    loadCourses();
  }

  if (sectionId === "faculty") {
    loadFaculty();
  }

  if (sectionId === "sections") {
    loadSections();
  }

  if (sectionId === "enrollments") {
    loadEnrollments();
  }
}

// --------------------------------------------------
// STUDENTS
// --------------------------------------------------

function showStudentForm() {
  const form = document.getElementById("studentForm");

  form.reset();

  document.getElementById("studentId").value = "";
  document.getElementById("studentFormTitle").textContent =
    "Add Student";

  form.classList.remove("hidden");

  showMessage("studentMessage", "");
}

function hideStudentForm() {
  document.getElementById("studentForm").reset();
  document.getElementById("studentId").value = "";
  document.getElementById("studentForm").classList.add("hidden");
}

async function loadStudents() {
  const container = document.getElementById("studentTable");

  try {
    const students = await requestJson(API.students);

    if (students.length === 0) {
      container.innerHTML = "<p>No students found.</p>";
      return;
    }

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Major</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          ${students
            .map(
              (student) => `
                <tr>
                  <td>${escapeHtml(student.firstName)}</td>
                  <td>${escapeHtml(student.lastName)}</td>
                  <td>${escapeHtml(student.email)}</td>
                  <td>${escapeHtml(student.major)}</td>

                  <td class="action-buttons">
                    <button
                      type="button"
                      class="edit-button"
                      onclick="editStudent('${student._id}')"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      class="delete-button"
                      onclick="deleteStudent('${student._id}')"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    `;
  } catch (error) {
    container.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
  }
}

async function editStudent(studentId) {
  try {
    const student = await requestJson(
      `${API.students}/${studentId}`
    );

    document.getElementById("studentId").value = student._id;
    document.getElementById("studentFirstName").value =
      student.firstName;
    document.getElementById("studentLastName").value =
      student.lastName;
    document.getElementById("studentEmail").value =
      student.email;
    document.getElementById("studentMajor").value =
      student.major;

    document.getElementById("studentFormTitle").textContent =
      "Edit Student";

    document
      .getElementById("studentForm")
      .classList.remove("hidden");
  } catch (error) {
    showMessage("studentMessage", error.message, true);
  }
}

async function deleteStudent(studentId) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this student?"
  );

  if (!confirmed) {
    return;
  }

  try {
    const result = await requestJson(
      `${API.students}/${studentId}`,
      {
        method: "DELETE"
      }
    );

    showMessage("studentMessage", result.message);
    await loadStudents();
  } catch (error) {
    showMessage("studentMessage", error.message, true);
  }
}

document
  .getElementById("studentForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const studentId =
      document.getElementById("studentId").value;

    const studentData = {
      firstName: document
        .getElementById("studentFirstName")
        .value.trim(),

      lastName: document
        .getElementById("studentLastName")
        .value.trim(),

      email: document
        .getElementById("studentEmail")
        .value.trim(),

      major: document
        .getElementById("studentMajor")
        .value.trim()
    };

    const editing = Boolean(studentId);

    try {
      await requestJson(
        editing
          ? `${API.students}/${studentId}`
          : API.students,
        {
          method: editing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(studentData)
        }
      );

      hideStudentForm();

      showMessage(
        "studentMessage",
        editing
          ? "Student updated successfully."
          : "Student added successfully."
      );

      await loadStudents();
    } catch (error) {
      showMessage("studentMessage", error.message, true);
    }
  });

// --------------------------------------------------
// COURSES
// --------------------------------------------------

function showCourseForm() {
  const form = document.getElementById("courseForm");

  form.reset();

  document.getElementById("courseId").value = "";
  document.getElementById("courseFormTitle").textContent =
    "Add Course";

  form.classList.remove("hidden");

  showMessage("courseMessage", "");
}

function hideCourseForm() {
  document.getElementById("courseForm").reset();
  document.getElementById("courseId").value = "";
  document.getElementById("courseForm").classList.add("hidden");
}

async function loadCourses() {
  const container = document.getElementById("courseTable");

  try {
    const courses = await requestJson(API.courses);

    if (courses.length === 0) {
      container.innerHTML = "<p>No courses found.</p>";
      return;
    }

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Course Code</th>
            <th>Course Name</th>
            <th>Department</th>
            <th>Credits</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          ${courses
            .map(
              (course) => `
                <tr>
                  <td>${escapeHtml(course.courseCode)}</td>
                  <td>${escapeHtml(course.courseName)}</td>
                  <td>${escapeHtml(course.department)}</td>
                  <td>${escapeHtml(course.credits)}</td>

                  <td class="action-buttons">
                    <button
                      type="button"
                      class="edit-button"
                      onclick="editCourse('${course._id}')"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      class="delete-button"
                      onclick="deleteCourse('${course._id}')"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    `;
  } catch (error) {
    container.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
  }
}

async function editCourse(courseId) {
  try {
    const course = await requestJson(
      `${API.courses}/${courseId}`
    );

    document.getElementById("courseId").value = course._id;
    document.getElementById("courseCode").value =
      course.courseCode;
    document.getElementById("courseName").value =
      course.courseName;
    document.getElementById("courseDepartment").value =
      course.department;
    document.getElementById("courseCredits").value =
      course.credits;

    document.getElementById("courseFormTitle").textContent =
      "Edit Course";

    document
      .getElementById("courseForm")
      .classList.remove("hidden");
  } catch (error) {
    showMessage("courseMessage", error.message, true);
  }
}

async function deleteCourse(courseId) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this course?"
  );

  if (!confirmed) {
    return;
  }

  try {
    const result = await requestJson(
      `${API.courses}/${courseId}`,
      {
        method: "DELETE"
      }
    );

    showMessage("courseMessage", result.message);
    await loadCourses();
  } catch (error) {
    showMessage("courseMessage", error.message, true);
  }
}

document
  .getElementById("courseForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const courseId =
      document.getElementById("courseId").value;

    const courseData = {
      courseCode: document
        .getElementById("courseCode")
        .value.trim(),

      courseName: document
        .getElementById("courseName")
        .value.trim(),

      department: document
        .getElementById("courseDepartment")
        .value.trim(),

      credits: Number(
        document.getElementById("courseCredits").value
      )
    };

    const editing = Boolean(courseId);

    try {
      await requestJson(
        editing
          ? `${API.courses}/${courseId}`
          : API.courses,
        {
          method: editing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(courseData)
        }
      );

      hideCourseForm();

      showMessage(
        "courseMessage",
        editing
          ? "Course updated successfully."
          : "Course added successfully."
      );

      await loadCourses();
    } catch (error) {
      showMessage("courseMessage", error.message, true);
    }
  });

// --------------------------------------------------
// FACULTY
// --------------------------------------------------

function showFacultyForm() {
  const form = document.getElementById("facultyForm");

  form.reset();

  document.getElementById("facultyId").value = "";
  document.getElementById("facultyFormTitle").textContent =
    "Add Faculty";

  form.classList.remove("hidden");

  showMessage("facultyMessage", "");
}

function hideFacultyForm() {
  document.getElementById("facultyForm").reset();
  document.getElementById("facultyId").value = "";
  document
    .getElementById("facultyForm")
    .classList.add("hidden");
}

async function loadFaculty() {
  const container = document.getElementById("facultyTable");

  try {
    const faculty = await requestJson(API.faculty);

    if (faculty.length === 0) {
      container.innerHTML =
        "<p>No faculty members found.</p>";
      return;
    }

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          ${faculty
            .map(
              (member) => `
                <tr>
                  <td>${escapeHtml(member.firstName)}</td>
                  <td>${escapeHtml(member.lastName)}</td>
                  <td>${escapeHtml(member.email)}</td>
                  <td>${escapeHtml(member.department)}</td>

                  <td class="action-buttons">
                    <button
                      type="button"
                      class="edit-button"
                      onclick="editFaculty('${member._id}')"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      class="delete-button"
                      onclick="deleteFaculty('${member._id}')"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    `;
  } catch (error) {
    container.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
  }
}

async function editFaculty(facultyId) {
  try {
    const member = await requestJson(
      `${API.faculty}/${facultyId}`
    );

    document.getElementById("facultyId").value = member._id;
    document.getElementById("facultyFirstName").value =
      member.firstName;
    document.getElementById("facultyLastName").value =
      member.lastName;
    document.getElementById("facultyEmail").value =
      member.email;
    document.getElementById("facultyDepartment").value =
      member.department;

    document.getElementById("facultyFormTitle").textContent =
      "Edit Faculty";

    document
      .getElementById("facultyForm")
      .classList.remove("hidden");
  } catch (error) {
    showMessage("facultyMessage", error.message, true);
  }
}

async function deleteFaculty(facultyId) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this faculty member?"
  );

  if (!confirmed) {
    return;
  }

  try {
    const result = await requestJson(
      `${API.faculty}/${facultyId}`,
      {
        method: "DELETE"
      }
    );

    showMessage("facultyMessage", result.message);
    await loadFaculty();
  } catch (error) {
    showMessage("facultyMessage", error.message, true);
  }
}

document
  .getElementById("facultyForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const facultyId =
      document.getElementById("facultyId").value;

    const facultyData = {
      firstName: document
        .getElementById("facultyFirstName")
        .value.trim(),

      lastName: document
        .getElementById("facultyLastName")
        .value.trim(),

      email: document
        .getElementById("facultyEmail")
        .value.trim(),

      department: document
        .getElementById("facultyDepartment")
        .value.trim()
    };

    const editing = Boolean(facultyId);

    try {
      await requestJson(
        editing
          ? `${API.faculty}/${facultyId}`
          : API.faculty,
        {
          method: editing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(facultyData)
        }
      );

      hideFacultyForm();

      showMessage(
        "facultyMessage",
        editing
          ? "Faculty member updated successfully."
          : "Faculty member added successfully."
      );

      await loadFaculty();
    } catch (error) {
      showMessage("facultyMessage", error.message, true);
    }
  });

// --------------------------------------------------
// SECTIONS
// --------------------------------------------------

async function populateSectionOptions() {
  const [courses, faculty] = await Promise.all([
    requestJson(API.courses),
    requestJson(API.faculty)
  ]);

  const courseSelect =
    document.getElementById("sectionCourseId");

  const facultySelect =
    document.getElementById("sectionFacultyId");

  courseSelect.innerHTML = `
    <option value="">Select a course</option>

    ${courses
      .map(
        (course) => `
          <option value="${course._id}">
            ${escapeHtml(course.courseCode)} -
            ${escapeHtml(course.courseName)}
          </option>
        `
      )
      .join("")}
  `;

  facultySelect.innerHTML = `
    <option value="">Select a faculty member</option>

    ${faculty
      .map(
        (member) => `
          <option value="${member._id}">
            ${escapeHtml(member.firstName)}
            ${escapeHtml(member.lastName)}
          </option>
        `
      )
      .join("")}
  `;
}

async function showSectionForm() {
  const form = document.getElementById("sectionForm");

  form.reset();

  document.getElementById("sectionId").value = "";
  document.getElementById("sectionFormTitle").textContent =
    "Add Section";

  try {
    await populateSectionOptions();
    form.classList.remove("hidden");
    showMessage("sectionMessage", "");
  } catch (error) {
    showMessage("sectionMessage", error.message, true);
  }
}

function hideSectionForm() {
  document.getElementById("sectionForm").reset();
  document.getElementById("sectionId").value = "";
  document
    .getElementById("sectionForm")
    .classList.add("hidden");
}

async function loadSections() {
  const container = document.getElementById("sectionTable");

  try {
    const sections = await requestJson(API.sections);

    if (sections.length === 0) {
      container.innerHTML = "<p>No sections found.</p>";
      return;
    }

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Section</th>
            <th>Course</th>
            <th>Faculty</th>
            <th>Semester</th>
            <th>Year</th>
            <th>Room</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          ${sections
            .map(
              (section) => `
                <tr>
                  <td>${escapeHtml(section.sectionNumber)}</td>

                  <td>
                    ${escapeHtml(
                      section.courseId?.courseCode || "N/A"
                    )}
                  </td>

                  <td>
                    ${
                      section.facultyId
                        ? `${escapeHtml(
                            section.facultyId.firstName
                          )} ${escapeHtml(
                            section.facultyId.lastName
                          )}`
                        : "N/A"
                    }
                  </td>

                  <td>${escapeHtml(section.semester)}</td>
                  <td>${escapeHtml(section.year)}</td>
                  <td>${escapeHtml(section.room)}</td>

                  <td class="action-buttons">
                    <button
                      type="button"
                      class="edit-button"
                      onclick="editSection('${section._id}')"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      class="delete-button"
                      onclick="deleteSection('${section._id}')"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    `;
  } catch (error) {
    container.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
  }
}

async function editSection(sectionId) {
  try {
    await populateSectionOptions();

    const section = await requestJson(
      `${API.sections}/${sectionId}`
    );

    document.getElementById("sectionId").value = section._id;
    document.getElementById("sectionNumber").value =
      section.sectionNumber;

    document.getElementById("sectionCourseId").value =
      section.courseId?._id || section.courseId;

    document.getElementById("sectionFacultyId").value =
      section.facultyId?._id || section.facultyId;

    document.getElementById("sectionSemester").value =
      section.semester;

    document.getElementById("sectionYear").value =
      section.year;

    document.getElementById("sectionRoom").value =
      section.room;

    document.getElementById("sectionFormTitle").textContent =
      "Edit Section";

    document
      .getElementById("sectionForm")
      .classList.remove("hidden");
  } catch (error) {
    showMessage("sectionMessage", error.message, true);
  }
}

async function deleteSection(sectionId) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this section?"
  );

  if (!confirmed) {
    return;
  }

  try {
    const result = await requestJson(
      `${API.sections}/${sectionId}`,
      {
        method: "DELETE"
      }
    );

    showMessage("sectionMessage", result.message);
    await loadSections();
  } catch (error) {
    showMessage("sectionMessage", error.message, true);
  }
}

document
  .getElementById("sectionForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const sectionId =
      document.getElementById("sectionId").value;

    const sectionData = {
      sectionNumber: document
        .getElementById("sectionNumber")
        .value.trim(),

      courseId: document
        .getElementById("sectionCourseId")
        .value,

      facultyId: document
        .getElementById("sectionFacultyId")
        .value,

      semester: document
        .getElementById("sectionSemester")
        .value,

      year: Number(
        document.getElementById("sectionYear").value
      ),

      room: document
        .getElementById("sectionRoom")
        .value.trim()
    };

    const editing = Boolean(sectionId);

    try {
      await requestJson(
        editing
          ? `${API.sections}/${sectionId}`
          : API.sections,
        {
          method: editing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(sectionData)
        }
      );

      hideSectionForm();

      showMessage(
        "sectionMessage",
        editing
          ? "Section updated successfully."
          : "Section added successfully."
      );

      await loadSections();
    } catch (error) {
      showMessage("sectionMessage", error.message, true);
    }
  });

// --------------------------------------------------
// ENROLLMENTS
// --------------------------------------------------

async function populateEnrollmentOptions() {
  const [students, sections] = await Promise.all([
    requestJson(API.students),
    requestJson(API.sections)
  ]);

  const studentSelect =
    document.getElementById("enrollmentStudentId");

  const sectionSelect =
    document.getElementById("enrollmentSectionId");

  studentSelect.innerHTML = `
    <option value="">Select a student</option>

    ${students
      .map(
        (student) => `
          <option value="${student._id}">
            ${escapeHtml(student.firstName)}
            ${escapeHtml(student.lastName)}
          </option>
        `
      )
      .join("")}
  `;

  sectionSelect.innerHTML = `
    <option value="">Select a section</option>

    ${sections
      .map(
        (section) => `
          <option value="${section._id}">
            ${escapeHtml(
              section.courseId?.courseCode || "Course"
            )}
            -
            Section ${escapeHtml(section.sectionNumber)}
            -
            ${escapeHtml(section.semester)}
            ${escapeHtml(section.year)}
          </option>
        `
      )
      .join("")}
  `;
}

async function showEnrollmentForm() {
  const form = document.getElementById("enrollmentForm");

  form.reset();

  document.getElementById("enrollmentId").value = "";
  document.getElementById(
    "enrollmentFormTitle"
  ).textContent = "Add Enrollment";

  try {
    await populateEnrollmentOptions();
    form.classList.remove("hidden");
    showMessage("enrollmentMessage", "");
  } catch (error) {
    showMessage("enrollmentMessage", error.message, true);
  }
}

function hideEnrollmentForm() {
  document.getElementById("enrollmentForm").reset();
  document.getElementById("enrollmentId").value = "";
  document
    .getElementById("enrollmentForm")
    .classList.add("hidden");
}

async function loadEnrollments() {
  const container =
    document.getElementById("enrollmentTable");

  try {
    const enrollments = await requestJson(API.enrollments);

    if (enrollments.length === 0) {
      container.innerHTML = "<p>No enrollments found.</p>";
      return;
    }

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Course</th>
            <th>Section</th>
            <th>Semester</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          ${enrollments
            .map(
              (enrollment) => `
                <tr>
                  <td>
                    ${
                      enrollment.studentId
                        ? `${escapeHtml(
                            enrollment.studentId.firstName
                          )} ${escapeHtml(
                            enrollment.studentId.lastName
                          )}`
                        : "N/A"
                    }
                  </td>

                  <td>
                    ${escapeHtml(
                      enrollment.sectionId?.courseId
                        ?.courseCode || "N/A"
                    )}
                  </td>

                  <td>
                    ${escapeHtml(
                      enrollment.sectionId?.sectionNumber ||
                        "N/A"
                    )}
                  </td>

                  <td>
                    ${
                      enrollment.sectionId
                        ? `${escapeHtml(
                            enrollment.sectionId.semester
                          )} ${escapeHtml(
                            enrollment.sectionId.year
                          )}`
                        : "N/A"
                    }
                  </td>

                  <td>${escapeHtml(enrollment.status)}</td>

                  <td class="action-buttons">
                    <button
                      type="button"
                      class="edit-button"
                      onclick="editEnrollment('${enrollment._id}')"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      class="delete-button"
                      onclick="deleteEnrollment('${enrollment._id}')"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    `;
  } catch (error) {
    container.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
  }
}

async function editEnrollment(enrollmentId) {
  try {
    await populateEnrollmentOptions();

    const enrollment = await requestJson(
      `${API.enrollments}/${enrollmentId}`
    );

    document.getElementById("enrollmentId").value =
      enrollment._id;

    document.getElementById("enrollmentStudentId").value =
      enrollment.studentId?._id || enrollment.studentId;

    document.getElementById("enrollmentSectionId").value =
      enrollment.sectionId?._id || enrollment.sectionId;

    document.getElementById("enrollmentStatus").value =
      enrollment.status;

    document.getElementById(
      "enrollmentFormTitle"
    ).textContent = "Edit Enrollment";

    document
      .getElementById("enrollmentForm")
      .classList.remove("hidden");
  } catch (error) {
    showMessage("enrollmentMessage", error.message, true);
  }
}

async function deleteEnrollment(enrollmentId) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this enrollment?"
  );

  if (!confirmed) {
    return;
  }

  try {
    const result = await requestJson(
      `${API.enrollments}/${enrollmentId}`,
      {
        method: "DELETE"
      }
    );

    showMessage("enrollmentMessage", result.message);
    await loadEnrollments();
  } catch (error) {
    showMessage("enrollmentMessage", error.message, true);
  }
}

document
  .getElementById("enrollmentForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const enrollmentId =
      document.getElementById("enrollmentId").value;

    const enrollmentData = {
      studentId: document
        .getElementById("enrollmentStudentId")
        .value,

      sectionId: document
        .getElementById("enrollmentSectionId")
        .value,

      status: document
        .getElementById("enrollmentStatus")
        .value
    };

    const editing = Boolean(enrollmentId);

    try {
      await requestJson(
        editing
          ? `${API.enrollments}/${enrollmentId}`
          : API.enrollments,
        {
          method: editing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(enrollmentData)
        }
      );

      hideEnrollmentForm();

      showMessage(
        "enrollmentMessage",
        editing
          ? "Enrollment updated successfully."
          : "Enrollment added successfully."
      );

      await loadEnrollments();
    } catch (error) {
      showMessage("enrollmentMessage", error.message, true);
    }
  });