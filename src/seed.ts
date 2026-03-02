import { User, Question, Test, TestAssignment, Notification, SchoolDomain, SiteSettings } from "./models";
import { hashPassword } from "./middleware/auth";

export async function seedDatabase() {
  const existingNew = await User.findOne({ email: "abdullah@nfskills.com" });
  if (existingNew) {
    const newPass = await hashPassword("NFskills@1234");
    await User.findByIdAndUpdate(existingNew._id, {
      role: "ADMIN",
      password: newPass,
      mustChangePassword: false,
    });
    try {
      await SchoolDomain.create({ domain: "nfskills.com" });
    } catch (e) {}

    let settings = await SiteSettings.findOne();
    if (!settings) {
      await SiteSettings.create({});
    }
    return;
  }

  const existingOld = await User.findOne({ email: "admin@school.com" });
  if (existingOld) {
    const newPass = await hashPassword("NFskills@1234");
    await User.findByIdAndUpdate(existingOld._id, {
      email: "abdullah@nfskills.com",
      password: newPass,
      name: "Abdullah",
      mustChangePassword: false,
    });
    try {
      await SchoolDomain.create({ domain: "nfskills.com" });
    } catch (e) {}
    console.log("Admin credentials updated to abdullah@nfskills.com / NFskills@1234");
    return;
  }

  console.log("Seeding database...");

  const adminPass = await hashPassword("NFskills@1234");
  const teacherPass = await hashPassword("teacher123");
  const studentPass = await hashPassword("student123");

  const admin = await User.create({
    email: "abdullah@nfskills.com",
    password: adminPass,
    name: "Abdullah",
    role: "ADMIN",
    isActive: true,
    mustChangePassword: false,
  });

  const teacher1 = await User.create({
    email: "teacher1@nfskills.com",
    password: teacherPass,
    name: "Mr. James Wilson",
    role: "TEACHER",
    isActive: true,
    mustChangePassword: false,
  });

  const teacher2 = await User.create({
    email: "teacher2@nfskills.com",
    password: teacherPass,
    name: "Ms. Emily Chen",
    role: "TEACHER",
    isActive: true,
    mustChangePassword: false,
  });

  const student1 = await User.create({
    email: "student1@nfskills.com",
    password: studentPass,
    name: "Alex Thompson",
    role: "STUDENT",
    isActive: true,
    mustChangePassword: false,
  });

  const student2 = await User.create({
    email: "student2@nfskills.com",
    password: studentPass,
    name: "Maria Garcia",
    role: "STUDENT",
    isActive: true,
    mustChangePassword: false,
  });

  const student3 = await User.create({
    email: "student3@nfskills.com",
    password: studentPass,
    name: "David Park",
    role: "STUDENT",
    isActive: true,
    mustChangePassword: false,
  });

  const student4 = await User.create({
    email: "student4@nfskills.com",
    password: studentPass,
    name: "Priya Sharma",
    role: "STUDENT",
    isActive: true,
    mustChangePassword: false,
  });

  try {
    await SchoolDomain.create({ domain: "nfskills.com" });
  } catch (e) {}

  await SiteSettings.create({});

  const mathQuestions = [
    { subject: "Mathematics", topic: "Algebra", questionText: "What is the value of x in the equation 2x + 5 = 15?", options: ["3", "5", "7", "10"], correctAnswer: 1, marks: 2, negativeMarks: 0 },
    { subject: "Mathematics", topic: "Algebra", questionText: "Simplify: 3(x + 4) - 2(x - 1)", options: ["x + 14", "x + 10", "5x + 14", "x + 12"], correctAnswer: 0, marks: 2, negativeMarks: 0 },
    { subject: "Mathematics", topic: "Geometry", questionText: "What is the area of a circle with radius 7 cm?", options: ["44 sq cm", "154 sq cm", "22 sq cm", "308 sq cm"], correctAnswer: 1, marks: 2, negativeMarks: 1 },
    { subject: "Mathematics", topic: "Geometry", questionText: "The sum of angles in a triangle is:", options: ["90 degrees", "180 degrees", "360 degrees", "270 degrees"], correctAnswer: 1, marks: 1, negativeMarks: 0 },
    { subject: "Mathematics", topic: "Arithmetic", questionText: "What is 15% of 200?", options: ["20", "25", "30", "35"], correctAnswer: 2, marks: 1, negativeMarks: 0 },
  ];

  const scienceQuestions = [
    { subject: "Science", topic: "Physics", questionText: "What is the SI unit of force?", options: ["Joule", "Watt", "Newton", "Pascal"], correctAnswer: 2, marks: 2, negativeMarks: 0 },
    { subject: "Science", topic: "Physics", questionText: "Which of the following is a vector quantity?", options: ["Speed", "Mass", "Temperature", "Velocity"], correctAnswer: 3, marks: 2, negativeMarks: 1 },
    { subject: "Science", topic: "Chemistry", questionText: "What is the chemical formula of water?", options: ["H2O", "CO2", "NaCl", "O2"], correctAnswer: 0, marks: 1, negativeMarks: 0 },
    { subject: "Science", topic: "Chemistry", questionText: "Which element has the atomic number 6?", options: ["Nitrogen", "Oxygen", "Carbon", "Boron"], correctAnswer: 2, marks: 2, negativeMarks: 0 },
    { subject: "Science", topic: "Biology", questionText: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi Body"], correctAnswer: 2, marks: 1, negativeMarks: 0 },
  ];

  const createdMathQs = [];
  for (const q of mathQuestions) {
    const created = await Question.create({ ...q, createdBy: teacher1._id });
    createdMathQs.push(created);
  }

  const createdSciQs = [];
  for (const q of scienceQuestions) {
    const created = await Question.create({ ...q, createdBy: teacher2._id });
    createdSciQs.push(created);
  }

  const mathTest = await Test.create({
    title: "Mathematics Mid-Term Exam",
    description: "Comprehensive test covering Algebra, Geometry, and Arithmetic",
    duration: 45,
    maxAttempts: 2,
    randomize: true,
    publishRule: "INSTANT",
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    createdBy: teacher1._id,
    status: "ACTIVE",
    questions: createdMathQs.map((q, idx) => ({ questionId: q._id, orderIndex: idx })),
  });

  const scienceTest = await Test.create({
    title: "Science Unit Test - Physics & Chemistry",
    description: "Test covering fundamental concepts in Physics and Chemistry",
    duration: 30,
    maxAttempts: 1,
    randomize: false,
    publishRule: "INSTANT",
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    createdBy: teacher2._id,
    status: "ACTIVE",
    questions: createdSciQs.map((q, idx) => ({ questionId: q._id, orderIndex: idx })),
  });

  const draftTest = await Test.create({
    title: "Biology Final Exam",
    description: "Comprehensive biology exam covering all chapters",
    duration: 60,
    maxAttempts: 1,
    randomize: true,
    publishRule: "MANUAL",
    createdBy: teacher2._id,
  });

  for (const student of [student1, student2, student3, student4]) {
    await TestAssignment.create({ testId: mathTest._id, studentId: student._id });
    await Notification.create({
      userId: student._id,
      title: "New Test Assigned",
      message: `You have been assigned: ${mathTest.title}`,
      type: "assignment",
    });
  }

  for (const student of [student1, student3]) {
    await TestAssignment.create({ testId: scienceTest._id, studentId: student._id });
    await Notification.create({
      userId: student._id,
      title: "New Test Assigned",
      message: `You have been assigned: ${scienceTest.title}`,
      type: "assignment",
    });
  }

  console.log("Database seeded successfully!");
  console.log("Login credentials:");
  console.log("  Admin: abdullah@nfskills.com / NFskills@1234");
  console.log("  Teacher 1: teacher1@nfskills.com / teacher123");
  console.log("  Teacher 2: teacher2@nfskills.com / teacher123");
  console.log("  Student 1: student1@nfskills.com / student123");
}
