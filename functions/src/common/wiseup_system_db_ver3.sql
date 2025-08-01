CREATE TABLE `Class` (
	`class_id`	bigint	NOT NULL,
	`subject_id`	bigint	NOT NULL,
	`class_name`	text	NOT NULL
);

CREATE TABLE `Attendance` (
	`att_id`	bigint	NOT NULL,
	`user_id`	bigint	NOT NULL,
	`student_id`	bigint	NOT NULL,
	`att_date`	date	NOT NULL,
	`att_status`	ENUM	NOT NULL,
	`att_reason`	text	NULL,
	`att_checkin_time`	time	NULL,
	`att_checkout_time`	time	NULL
);

CREATE TABLE `Teacher` (
	`teacher_id`	bigint	NOT NULL,
	`user_id`	bigint	NOT NULL,
	`class_id`	bigint	NOT NULL,
	`teacher_name`	varchar	NOT NULL,
	`teacher_subject`	ENUM	NOT NULL
);

CREATE TABLE `Teacher_Subjects` (
	`teacher_id`	bigint	NOT NULL,
	`subject_id`	bigint	NOT NULL,
	`is_primary`	boolean	NULL
);

CREATE TABLE `Parent_student` (
	`parent_id`	bigint	NOT NULL,
	`student_id`	bigint	NOT NULL
);

CREATE TABLE `Exam` (
	`exam_id`	bigint	NOT NULL,
	`user_id`	bigint	NOT NULL,
	`subject_id`	bigint	NOT NULL,
	`exam_type_id2`	bigint	NOT NULL,
	`student_id`	bigint	NOT NULL,
	`exam_score`	int	NOT NULL
);

CREATE TABLE `Parents` (
	`parent_id`	bigint	NOT NULL,
	`user_id`	bigint	NOT NULL
);

CREATE TABLE `Roles` (
	`role_id`	varchar	NOT NULL,
	`role_name`	varchar	NOT NULL
);

CREATE TABLE `Notification` (
	`noti_target_user_id`	bigint	NOT NULL,
	`user_id`	bigint	NOT NULL,
	`noti_channel`	varchar	NOT NULL,
	`noti_message`	text	NOT NULL,
	`noti_status`	ENUM	NOT NULL
);

CREATE TABLE `Schedules` (
	`schedule_id`	bigint	NOT NULL,
	`user_id`	bigint	NOT NULL,
	`class_id`	bigint	NOT NULL,
	`subject_id`	bigint	NOT NULL,
	`student_id`	bigint	NOT NULL,
	`start_date`	date	NOT NULL,
	`end_date`	date	NOT NULL,
	`title`	varchar	NOT NULL,
	`description`	text	NULL,
	`created_at`	timestamp	NOT NULL
);

CREATE TABLE `Seats` (
	`seat_id`	bigint	NOT NULL,
	`room_id`	varchar	NOT NULL,
	`pos_x`	int	NOT NULL,
	`pos_y`	int	NOT NULL
);

CREATE TABLE `Student` (
	`student_id`	bigint	NOT NULL,
	`user_id`	bigint	NOT NULL,
	`student_name`	varchar	NOT NULL,
	`student_target_univ`	varchar	NULL,
	`student_photo`	varchar	NULL,
	`student_age`	varchar	NULL,
	`student_schoolname`	varchar	NULL
);

CREATE TABLE `Seat_assignments` (
	`seat_id`	bigint	NOT NULL,
	`att_id`	bigint	NOT NULL,
	`user_id`	bigint	NOT NULL,
	`student_id`	bigint	NOT NULL,
	`assign_date`	date	NOT NULL,
	`start_time`	time	NOT NULL,
	`end_time`	time	NOT NULL
);

CREATE TABLE `Exam_type` (
	`exam_type_id`	bigint	NOT NULL,
	`exam_type`	varchar	NOT NULL
);

CREATE TABLE `User_roles` (
	`user_id`	bigint	NOT NULL,
	`role_id`	varchar	NOT NULL
);

CREATE TABLE `User` (
	`user_id`	bigint	NOT NULL,
	`user_name`	varchar	NOT NULL,
	`user_phone`	varchar	NOT NULL,
	`user_email`	varchar	NOT NULL,
	`user_password_hash`	varchar	NOT NULL,
	`user_status`	varchar	NOT NULL
);

CREATE TABLE `Subjects` (
	`subject_id`	bigint	NOT NULL,
	`subject_name`	varchar	NOT NULL
);

CREATE TABLE `Class_Students` (
	`class_id`	bigint	NOT NULL,
	`student_id`	bigint	NOT NULL,
	`enrollment_date`	date	NOT NULL,
	`status`	ENUM	NULL	DEFAULT 'active'
);

CREATE TABLE `Rooms` (
	`room_id`	varchar	NOT NULL,
	`room_name`	varchar	NOT NULL,
	`capacity`	int	NOT NULL,
	`room_type`	ENUM	NOT NULL
);

CREATE TABLE `Exam_Results` (
	`exam_id`	bigint	NOT NULL,
	`student_id`	bigint	NOT NULL,
	`score`	int	NOT NULL,
	`max_score`	int	NOT NULL,
	`exam_date`	date	NOT NULL
);

ALTER TABLE `Class` ADD CONSTRAINT `PK_CLASS` PRIMARY KEY (
	`class_id`,
	`subject_id`
);

ALTER TABLE `Attendance` ADD CONSTRAINT `PK_ATTENDANCE` PRIMARY KEY (
	`att_id`,
	`user_id`
);

ALTER TABLE `Teacher` ADD CONSTRAINT `PK_TEACHER` PRIMARY KEY (
	`teacher_id`
);

ALTER TABLE `Teacher_Subjects` ADD CONSTRAINT `PK_TEACHER_SUBJECTS` PRIMARY KEY (
	`teacher_id`,
	`subject_id`
);

ALTER TABLE `Parent_student` ADD CONSTRAINT `PK_PARENT_STUDENT` PRIMARY KEY (
	`parent_id`,
	`student_id`
);

ALTER TABLE `Exam` ADD CONSTRAINT `PK_EXAM` PRIMARY KEY (
	`exam_id`,
	`user_id`,
	`subject_id`,
	`exam_type_id2`
);

ALTER TABLE `Parents` ADD CONSTRAINT `PK_PARENTS` PRIMARY KEY (
	`parent_id`,
	`user_id`
);

ALTER TABLE `Roles` ADD CONSTRAINT `PK_ROLES` PRIMARY KEY (
	`role_id`
);

ALTER TABLE `Notification` ADD CONSTRAINT `PK_NOTIFICATION` PRIMARY KEY (
	`noti_target_user_id`,
	`user_id`
);

ALTER TABLE `Schedules` ADD CONSTRAINT `PK_SCHEDULES` PRIMARY KEY (
	`schedule_id`,
	`user_id`,
	`class_id`,
	`subject_id`
);

ALTER TABLE `Seats` ADD CONSTRAINT `PK_SEATS` PRIMARY KEY (
	`seat_id`
);

ALTER TABLE `Student` ADD CONSTRAINT `PK_STUDENT` PRIMARY KEY (
	`student_id`,
	`user_id`
);

ALTER TABLE `Seat_assignments` ADD CONSTRAINT `PK_SEAT_ASSIGNMENTS` PRIMARY KEY (
	`seat_id`,
	`att_id`,
	`user_id`
);

ALTER TABLE `Exam_type` ADD CONSTRAINT `PK_EXAM_TYPE` PRIMARY KEY (
	`exam_type_id`
);

ALTER TABLE `User_roles` ADD CONSTRAINT `PK_USER_ROLES` PRIMARY KEY (
	`user_id`,
	`role_id`
);

ALTER TABLE `User` ADD CONSTRAINT `PK_USER` PRIMARY KEY (
	`user_id`
);

ALTER TABLE `Subjects` ADD CONSTRAINT `PK_SUBJECTS` PRIMARY KEY (
	`subject_id`
);

ALTER TABLE `Class_Students` ADD CONSTRAINT `PK_CLASS_STUDENTS` PRIMARY KEY (
	`class_id`,
	`student_id`
);

ALTER TABLE `Rooms` ADD CONSTRAINT `PK_ROOMS` PRIMARY KEY (
	`room_id`
);

ALTER TABLE `Exam_Results` ADD CONSTRAINT `PK_EXAM_RESULTS` PRIMARY KEY (
	`exam_id`,
	`student_id`
);

ALTER TABLE `Class` ADD CONSTRAINT `FK_Subjects_TO_Class_1` FOREIGN KEY (
	`subject_id`
)
REFERENCES `Subjects` (
	`subject_id`
);

ALTER TABLE `Attendance` ADD CONSTRAINT `FK_Student_TO_Attendance_1` FOREIGN KEY (
	`user_id`
)
REFERENCES `Student` (
	`user_id`
);

ALTER TABLE `Teacher_Subjects` ADD CONSTRAINT `FK_Teacher_TO_Teacher_Subjects_1` FOREIGN KEY (
	`teacher_id`
)
REFERENCES `Teacher` (
	`teacher_id`
);

ALTER TABLE `Teacher_Subjects` ADD CONSTRAINT `FK_Subjects_TO_Teacher_Subjects_1` FOREIGN KEY (
	`subject_id`
)
REFERENCES `Subjects` (
	`subject_id`
);

ALTER TABLE `Parent_student` ADD CONSTRAINT `FK_Parents_TO_Parent_student_1` FOREIGN KEY (
	`parent_id`
)
REFERENCES `Parents` (
	`parent_id`
);

ALTER TABLE `Parent_student` ADD CONSTRAINT `FK_Student_TO_Parent_student_1` FOREIGN KEY (
	`student_id`
)
REFERENCES `Student` (
	`student_id`
);

ALTER TABLE `Exam` ADD CONSTRAINT `FK_Student_TO_Exam_1` FOREIGN KEY (
	`user_id`
)
REFERENCES `Student` (
	`user_id`
);

ALTER TABLE `Exam` ADD CONSTRAINT `FK_Subjects_TO_Exam_1` FOREIGN KEY (
	`subject_id`
)
REFERENCES `Subjects` (
	`subject_id`
);

ALTER TABLE `Exam` ADD CONSTRAINT `FK_Exam_type_TO_Exam_1` FOREIGN KEY (
	`exam_type_id2`
)
REFERENCES `Exam_type` (
	`exam_type_id`
);

ALTER TABLE `Parents` ADD CONSTRAINT `FK_User_TO_Parents_1` FOREIGN KEY (
	`user_id`
)
REFERENCES `User` (
	`user_id`
);

ALTER TABLE `Notification` ADD CONSTRAINT `FK_User_TO_Notification_1` FOREIGN KEY (
	`user_id`
)
REFERENCES `User` (
	`user_id`
);

ALTER TABLE `Schedules` ADD CONSTRAINT `FK_Student_TO_Schedules_1` FOREIGN KEY (
	`user_id`
)
REFERENCES `Student` (
	`user_id`
);

ALTER TABLE `Schedules` ADD CONSTRAINT `FK_Class_TO_Schedules_1` FOREIGN KEY (
	`class_id`
)
REFERENCES `Class` (
	`class_id`
);

ALTER TABLE `Schedules` ADD CONSTRAINT `FK_Class_TO_Schedules_2` FOREIGN KEY (
	`subject_id`
)
REFERENCES `Class` (
	`subject_id`
);

ALTER TABLE `Student` ADD CONSTRAINT `FK_User_TO_Student_1` FOREIGN KEY (
	`user_id`
)
REFERENCES `User` (
	`user_id`
);

ALTER TABLE `Seat_assignments` ADD CONSTRAINT `FK_Seats_TO_Seat_assignments_1` FOREIGN KEY (
	`seat_id`
)
REFERENCES `Seats` (
	`seat_id`
);

ALTER TABLE `Seat_assignments` ADD CONSTRAINT `FK_Attendance_TO_Seat_assignments_1` FOREIGN KEY (
	`att_id`
)
REFERENCES `Attendance` (
	`att_id`
);

ALTER TABLE `Seat_assignments` ADD CONSTRAINT `FK_Attendance_TO_Seat_assignments_2` FOREIGN KEY (
	`user_id`
)
REFERENCES `Attendance` (
	`user_id`
);

ALTER TABLE `User_roles` ADD CONSTRAINT `FK_User_TO_User_roles_1` FOREIGN KEY (
	`user_id`
)
REFERENCES `User` (
	`user_id`
);

ALTER TABLE `User_roles` ADD CONSTRAINT `FK_Roles_TO_User_roles_1` FOREIGN KEY (
	`role_id`
)
REFERENCES `Roles` (
	`role_id`
);

ALTER TABLE `Class_Students` ADD CONSTRAINT `FK_Class_TO_Class_Students_1` FOREIGN KEY (
	`class_id`
)
REFERENCES `Class` (
	`class_id`
);

ALTER TABLE `Class_Students` ADD CONSTRAINT `FK_Student_TO_Class_Students_1` FOREIGN KEY (
	`student_id`
)
REFERENCES `Student` (
	`student_id`
);

ALTER TABLE `Exam_Results` ADD CONSTRAINT `FK_Exam_TO_Exam_Results_1` FOREIGN KEY (
	`exam_id`
)
REFERENCES `Exam` (
	`exam_id`
);

ALTER TABLE `Exam_Results` ADD CONSTRAINT `FK_Student_TO_Exam_Results_1` FOREIGN KEY (
	`student_id`
)
REFERENCES `Student` (
	`student_id`
);

