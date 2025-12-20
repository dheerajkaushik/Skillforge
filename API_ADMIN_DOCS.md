# SkillForge – Admin User Management API

## Base URL
/api/admin/users

---

## 1. Get all users (Admin only)
**GET /api/admin/users**

### Headers:
Authorization: Bearer <JWT Token>

### Response:
[
{
"id": 1,
"email": "student@xyz.com",
"role": "STUDENT"
},
{
"id": 2,
"email": "instructor@xyz.com",
"role": "INSTRUCTOR"
}
]

---

## 2. Update user role (Admin only)
**PUT /api/admin/users/{id}/role?role=INSTRUCTOR**

Roles allowed:
- STUDENT
- INSTRUCTOR
- ADMIN

### Example:
PUT /api/admin/users/5/role?role=ADMIN

### Response:
"Role updated to ADMIN"

### Delete user (Admin)
DELETE /api/admin/users/{id}

### Enrollment stats (Admin)
GET /api/admin/stats/enrollments

### List submissions (Admin)
GET /api/admin/submissions
optional query: ?courseId=123 or ?userId=45

### Activity logs (Admin)
GET /api/admin/logs

### Permissions
Available permission keys:
- CREATE_COURSE, CREATE_MODULE, CREATE_LESSON, GRADE_SUBMISSION,
- MANAGE_USERS, VIEW_ALL_SUBMISSIONS, VIEW_DASHBOARD, DELETE_USER, VIEW_LOGS

Roles are mapped to permissions on server side. Admin has all permissions.
